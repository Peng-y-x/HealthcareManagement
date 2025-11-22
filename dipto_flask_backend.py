from flask import Flask, request, jsonify
import pymysql

app = Flask(__name__)

@app.route("/update_appointment", methods = ["POST"])
def update():
    if request.method == "POST":
        conn = pymysql.connect(
            host = "temp",
            user = "temp",
            db = "temp"
        )
        cursor = conn.cursor()

        the_id = request.form["the_id"]
        new_clinic = request.form["new_clinic"]
        new_phys = request.form["new_phys"]
        new_date = request.form["new_date"]
        new_time = request.form["new_time"]
        query = "update Appointment set ClinicID = %s, PhysicianID = %s, AppointmentDate = %s, AppointmentTime = %s where AppointmentID = %s"
        cursor.execute(query, (new_clinic, new_phys, new_date, new_time, the_id))

        


        conn.commit()
        cursor.close()
        conn.close()

@app.route("/delete_appointment", methods = ["POST"])
def delete():
    if request.method == "POST":
        conn = pymysql.connect(
            host = "temp",
            user = "temp",
            db = "temp"
        )
        cursor = conn.cursor()

        old_id = request.form["old_id"]
        query = "delete * from Appointment where AppointmentID = %s"
        cursor.execute(query, (old_id))


        conn.commit()
        cursor.close()
        conn.close()

@app.route("/filter", methods = ["GET"])
def filter():
    if request.method == "GET":
        conn = pymysql.connect(
        host = "temp",
        user = "temp",
        db = "temp"
        )
        cursor = conn.cursor()
        
        table = request.form["table"]
        column = reqest.form["column"]
        value = request.form["value"]
        # parameterized to protect against sql
        # injection
        query = "select * from %s where %s = %s"
        cursor.execute(query, (table, column, value))
        filtered = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify(filtered)
    
if __name__ == "__main__":
    app.run(denug = True)
