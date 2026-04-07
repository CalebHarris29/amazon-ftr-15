# ROS 2 Dual-Architecture Web Dashboard

A robust, high-speed web interface designed to teleport raw physical velocity commands (TwistStamped) to a ROS 2 robot environment natively across the network. 

## Architectural Overview
This dashboard utilizes a **Dual-Architecture** pipeline to seamlessly bypass firewall constraints and WebSocket packet drops typical in `rosbridge_suite` Humble deployments over enterprise WiFi:

1. **Inbound Fast-Track (HTTP POST)**: Web UI joystick movements are fired as raw HTTP `fetch()` parameters directly to a dedicated lightweight Python Flask node (`server.py`) sitting natively on the Linux ROS 2 machine.
2. **Outbound Diagnostic Stream (WebSockets)**: The React app simultaneously sustains a standard `roslibjs` proxy connection to the `rosbridge_server` strictly to digest returning diagnostic streams (e.g., `/chatter`).

---

## 🚀 Setup Instructions

### Part 1: Linux Robot Environment Setup
*The physical robot and the drivers live here.*

1. **Install Requirements:** Make sure your Ubuntu/Linux machine has standard Python web hosting capabilities installed.
   ```bash
   sudo apt install python3-flask python3-flask-cors
   ```

2. **Create the HTTP Middleman (`server.py`):**
   Somewhere in your ROS 2 workspace, create a file named `server.py` and paste the following Python code into it:
   ```python
   from flask import Flask, request
   from flask_cors import CORS
   import rclpy
   from rclpy.node import Node
   from geometry_msgs.msg import TwistStamped

   app = Flask(__name__)
   CORS(app) 

   ros_node = None
   twist_pub = None

   def init_ros():
       global ros_node, twist_pub
       rclpy.init()
       ros_node = rclpy.create_node('http_joystick')
       twist_pub = ros_node.create_publisher(TwistStamped, '/twist_controller/commands', 10)

   @app.route('/twist', methods=['POST', 'GET'])
   def handle_twist():
       lx = float(request.args.get('lx', 0.0))
       ly = float(request.args.get('ly', 0.0))
       lz = float(request.args.get('lz', 0.0))
       
       msg = TwistStamped()
       msg.header.frame_id = "base_link"
       msg.twist.linear.x = lx
       msg.twist.linear.y = ly
       msg.twist.linear.z = lz
       
       twist_pub.publish(msg)
       return "OK", 200

   if __name__ == '__main__':
       init_ros()
       app.run(host='0.0.0.0', port=5000)
   ```

3. **Start the Dual Servers:** You will need two terminal windows open on your Linux machine.
   * **Terminal 1:** Run `rosbridge_server`
   * **Terminal 2:** Run `source /opt/ros/humble/setup.bash && python3 server.py`

---

### Part 2: Mac / Web Dashboard Setup
*The Operator Control Station.*

1. **Install Dependencies & Run:**
   ```bash
   npm i
   npm run dev
   ```
2. **Connect the UI:** 
   * When the React app opens in your browser, look for the **Connection Settings** card.
   * Type in the Web Socket URL of your Linux Machine (Example: `ws://10.26.97.120:9090`).
   * Click **Connect**. The dot will turn Green, indicating the diagnostic stream is active.
   * *Note: The React app will dynamically extract the IP address strictly from this WebSocket URL and use it to blast the backend HTTP joystick commands to port 5000 automatically.*

3. **Drive the Robot:**
   Press and hold the blue Cartesian D-Pad axes. The math will stream directly to `/twist_controller/commands` at 20-Hertz!
