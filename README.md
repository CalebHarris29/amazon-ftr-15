# 📦 Amazon FTR: Automated Robotics Inspection System

![React](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript-blue)
![ROS 2](https://img.shields.io/badge/Robotics-ROS%202%20Humble-green)
![Python](https://img.shields.io/badge/Backend-Python%20Flask-yellow)
![Hardware](https://img.shields.io/badge/Hardware-Kinova%20Kortex%20Arm-red)

A robust, high-speed full-stack web interface designed to teleport physical velocity commands to an industrial robotic arm natively across a network. Built as a capstone project to automate the notoriously slow, manual inspection of return processing in Amazon warehouses.

## 📖 The Vision
Amazon handles a massive volume of returns daily, creating a logistical bottleneck. Manual inspection is time-consuming, prone to error, and limits throughput. 

**Our Solution:** An intelligent, network-driven robotic teleoperation system that completely decouples human operators from the hazardous sorting floor. By leveraging precise ROS 2 manipulation remotely, we slash repetitive labor costs and drastically increase restitution speeds.

---

## 🏗️ System Architecture
This project utilizes a **Dual-Architecture** pipeline to seamlessly bypass firewall constraints and WebSocket packet drops typical in `rosbridge_suite` deployments over enterprise/university Wi-Fi.

```mermaid
graph TD;
    A[Human Operator] -->|X/Y/Z Joystick| B(Mac: React Dashboard);
    B -->|HTTP POST Fetch| C[Linux: Python Flask Server];
    B <..>|WebSockets Diagnostics| D[Linux: rosbridge_server];
    C -->|TwistStamped Vector| E((ROS 2 Kinematic Engine));
    E -->|Motor Execution| F{Kinova Robotic Arm};
    F -.->|Status Updates| E;
    E -.->|/chatter Topic| D;
```

### Lane 1: Inbound Fast-Track (HTTP POST)
Web UI joystick movements are fired as guaranteed HTTP `fetch()` requests directly to a dedicated lightweight Python Flask node (`server.py`) sitting natively on the Linux machine. This completely negates ROS 2 DDS discovery bugs and ensures zero commands are lost.

### Lane 2: Outbound Diagnostics (WebSockets)
The React app simultaneously sustains a standard `roslibjs` proxy connection to the `rosbridge_server` strictly to digest returning network streams without bogging down the HTTP tunnel.

---

## 🚀 Setup & Deployment

### Part 1: Linux Robot Environment Setup
*The physical robot and the drivers live here.*

1. **Install Requirements:** Make sure your Ubuntu/Linux machine has standard Python web hosting capabilities installed.
   ```bash
   sudo apt update
   sudo apt install python3-flask python3-flask-cors
   ```

2. **Start the Dual Servers:** You will need two terminal windows open on your Linux machine.
   * **Terminal 1:** Run `rosbridge_server`
   * **Terminal 2:** Navigate to the `/backend` folder of this repo and run the Flask API.
     ```bash
     source /opt/ros/humble/setup.bash
     python3 server.py
     ```

### Part 2: Mac / Web Dashboard Setup
*The Operator Control Station.*

1. **Install Dependencies & Run:**
   ```bash
   npm install
   npm run dev
   ```
2. **Connect the UI:** 
   * When the React app opens in your browser, look for the **Connection Settings** card.
   * Type in the Web Socket URL of your Linux Machine (Example: `ws://10.26.97.120:9090`).
   * *Note: The React app will dynamically extract the IP address strictly from this WebSocket URL and use it to blast the backend HTTP joystick commands automatically.*

3. **Drive the Robot:**
   Press and hold the blue Cartesian D-Pad axes. The system will mathematically stream vectors directly to `/twist_controller/commands` at 20-Hertz!
