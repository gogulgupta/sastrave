/*************************************************
 * HYBRID SMART SHOES – FINAL OFFLINE + GPS + AES128
 *************************************************/

#define BLYNK_PRINT Serial

#define BLYNK_TEMPLATE_ID   "TMPL3oTVfDPGk"
#define BLYNK_TEMPLATE_NAME "hybrid smart shoes"
#define BLYNK_AUTH_TOKEN    "Fy9DrMSPlw60Kq42yxmO-5CBU0iqRfKN"

/* ---------------- LIBRARIES ---------------- */
#include <WiFi.h>
#include <BlynkSimpleEsp32.h>
#include <Wire.h>
#include <MPU6050.h>
#include <DHT.h>
#include <TinyGPSPlus.h>
#include <cstring>
#include "AESLib.h"

/* ---------------- WIFI ---------------- */
char ssid[] = "Gogul";
char pass[] = "g12345678";

/* ---------------- PINS ---------------- */
#define BUTTON     15
#define VC02_RX    19
#define IRSENSOR   18
#define BUZZER     2
#define RELAY      23
#define DHTPIN     5
#define SIM_RX     16
#define SIM_TX     17
#define GPS_RX     26
#define GPS_TX     25

/* ---------------- SECRET MESSAGE ---------------- */
const char* BUTTON_SECRET_MSG =
"7URQvd2wp9XSsdBSYRM0CtOLlL58KJ6L9Hsh9U6ySUU7SH1VcpJ+uJ8Ch+Oa1NIb";

/* ---------------- OBJECTS ---------------- */
MPU6050 mpu;
DHT dht(DHTPIN, DHT11);
TinyGPSPlus gps;
AESLib aesLib;

HardwareSerial VC02(1);
HardwareSerial SIM800(2);
HardwareSerial GPS(0);

/* ---------------- FLAGS ---------------- */
bool emergencyActive = false;
bool irSafetyEnabled = false;
bool wifiConnected = false;
bool blynkConnected = false;

/* ---------------- RELAY PUSH MODE ---------------- */
bool relayTempOn = false;
unsigned long relayOnTime = 0;
const unsigned long RELAY_PUSH_TIME = 5000;

/* ---------------- VARIABLES ---------------- */
unsigned long emergencyStart = 0;
unsigned long lastFallTime = 0;
int stepCount = 0;

/* ---------------- CONSTANTS ---------------- */
const unsigned long RELAY_TIME = 5000;
const float FALL_THRESHOLD = 2.5;
const float STEP_THRESHOLD = 1.2;

/* ---------------- AES CONFIG ---------------- */
byte aes_key[] = {
  0x31,0x32,0x33,0x34,
  0x35,0x36,0x37,0x38,
  0x39,0x30,0x41,0x42,
  0x43,0x44,0x45,0x46
};

byte aes_iv[N_BLOCK] = {0};

/* ---------------- WIFI ---------------- */
void connectWiFi() {
  WiFi.begin(ssid, pass);
  unsigned long t = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t < 8000) {
    delay(200);
  }
  wifiConnected = (WiFi.status() == WL_CONNECTED);
}

/* ---------------- BLYNK ---------------- */
void connectBlynk() {
  if (!wifiConnected) return;
  Blynk.config(BLYNK_AUTH_TOKEN);
  blynkConnected = Blynk.connect(3000);
}

/* ---------------- AES ENCRYPT ---------------- */
String encryptAES(String plain) {
  char encrypted[256];
  aesLib.encrypt64(
    (byte*)plain.c_str(),
    plain.length(),
    encrypted,
    aes_key,
    sizeof(aes_key),
    aes_iv
  );
  return String(encrypted);
}

/* ---------------- GPS LOCATION ---------------- */
String getGPSLocation() {
  unsigned long start = millis();
  while (millis() - start < 3000) {
    while (GPS.available()) {
      gps.encode(GPS.read());
    }
  }
  if (gps.location.isValid()) {
    String loc = String(gps.location.lat(), 6);
    loc += ",";
    loc += String(gps.location.lng(), 6);
    return loc;
  }
  return "GPS_NOT_FIXED";
}

/* ---------------- SEND SMS ---------------- */
void sendSMS(const char* src) {

  SIM800.println("AT+CMGF=1");
  delay(300);
  SIM800.println("AT+CMGS=\"+91XXXXXXXXXX\"");
  delay(300);

  SIM800.println("EMERGENCY ALERT");
  SIM800.print("Source: ");
  SIM800.println(src);

  if (strcmp(src, "BUTTON") == 0) {
    SIM800.println("MESSAGE:");
    SIM800.println(BUTTON_SECRET_MSG);
  } else {
    String encLoc = encryptAES(getGPSLocation());
    SIM800.println("Encrypted Location:");
    SIM800.println(encLoc);
  }

  SIM800.write(26);
}

/* ---------------- BLYNK EVENT ---------------- */
void sendBlynkMail(const char* src) {
  if (!blynkConnected) return;

  String msg = "Emergency\nSource: ";
  msg += src;

  if (strcmp(src, "BUTTON") == 0) {
    msg += "\nMESSAGE:\n";
    msg += BUTTON_SECRET_MSG;
  } else {
    msg += "\nEncrypted Location:\n";
    msg += encryptAES(getGPSLocation());
  }

  Blynk.logEvent("emergency_alert", msg);
}

/* ---------------- EMERGENCY ---------------- */
void triggerEmergency(const char* src) {
  if (emergencyActive) return;

  emergencyActive = true;
  emergencyStart = millis();

  digitalWrite(RELAY, LOW);
  digitalWrite(BUZZER, HIGH);

  sendSMS(src);
  sendBlynkMail(src);

  if (blynkConnected)
    Blynk.virtualWrite(V3, "EMERGENCY");
}

/* ---------------- VC-02 ---------------- */
void readVC02() {
  static uint8_t buf[2];
  static uint8_t i = 0;

  while (VC02.available()) {
    buf[i++] = VC02.read();
    if (i == 2) {
      if (buf[0] == 0x20 && buf[1] == 0xA0) {
        triggerEmergency("VOICE");
      }
      i = 0;
    }
  }
}

/* ---------------- MPU6050 ---------------- */
void readMPU() {
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);

  float acc = sqrt(ax * ax + ay * ay + az * az) / 16384.0;

  if (acc > STEP_THRESHOLD) {
    stepCount++;
    if (blynkConnected)
      Blynk.virtualWrite(V4, stepCount);
    delay(250);
  }

  if (acc > FALL_THRESHOLD && millis() - lastFallTime > 5000) {
    lastFallTime = millis();
    triggerEmergency("FALL");
  }
}

/* ---------------- DHT ---------------- */
void readDHT() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (!isnan(t) && !isnan(h) && blynkConnected) {
    Blynk.virtualWrite(V6, t);
    Blynk.virtualWrite(V7, h);
  }
}

/* ---------------- BLYNK INPUT ---------------- */
BLYNK_WRITE(V1) {
  if (param.asInt())
    triggerEmergency("APP");
}

BLYNK_WRITE(V5) {
  irSafetyEnabled = param.asInt();
}

BLYNK_WRITE(V8) {
  if (param.asInt() == 1 && !relayTempOn) {
    digitalWrite(RELAY, LOW);
    relayTempOn = true;
    relayOnTime = millis();
  }
}

/* ---------------- SETUP ---------------- */
void setup() {
  Serial.begin(115200);

  VC02.begin(9600, SERIAL_8N1, VC02_RX, -1);
  SIM800.begin(9600, SERIAL_8N1, SIM_RX, SIM_TX);
  GPS.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);

  pinMode(BUTTON, INPUT_PULLUP);
  pinMode(IRSENSOR, INPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(RELAY, OUTPUT);

  digitalWrite(RELAY, HIGH);
  digitalWrite(BUZZER, LOW);

  Wire.begin(21, 22);
  mpu.initialize();
  dht.begin();

  connectWiFi();
  connectBlynk();

  Serial.println("SYSTEM READY");
}

/* ---------------- LOOP ---------------- */
void loop() {

  if (wifiConnected && blynkConnected)
    Blynk.run();

  while (GPS.available())
    gps.encode(GPS.read());

  readVC02();
  readMPU();
  readDHT();

  if (digitalRead(BUTTON) == LOW) {
    triggerEmergency("BUTTON");
    delay(500);
  }

  if (irSafetyEnabled && !emergencyActive) {
    digitalWrite(BUZZER, digitalRead(IRSENSOR) == LOW);
  } else if (!emergencyActive) {
    digitalWrite(BUZZER, LOW);
  }

  if (relayTempOn && millis() - relayOnTime >= RELAY_PUSH_TIME) {
    digitalWrite(RELAY, HIGH);
    relayTempOn = false;
  }

  if (emergencyActive && millis() - emergencyStart >= RELAY_TIME) {
    digitalWrite(RELAY, HIGH);
    digitalWrite(BUZZER, LOW);
    emergencyActive = false;
    if (blynkConnected)
      Blynk.virtualWrite(V3, "SAFE");
  }
}
