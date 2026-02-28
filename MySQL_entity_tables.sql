CREATE TABLE Clinic (
   clinic_id INT PRIMARY KEY AUTO_INCREMENT,
   clinic_name VARCHAR(100) NOT NULL,
   phone_number VARCHAR(15),
   street_address VARCHAR(150),
   city VARCHAR(50),
   state VARCHAR(50),
   zip_code VARCHAR(10)
);


CREATE TABLE Department (
   department_id INT PRIMARY KEY AUTO_INCREMENT,
   department_name VARCHAR(100) NOT NULL,
   description VARCHAR(255),
   clinic_id INT NOT NULL,
   FOREIGN KEY (clinic_id) REFERENCES Clinic(clinic_id)
       ON DELETE CASCADE
       ON UPDATE CASCADE
);


CREATE TABLE Office (
   office_id INT PRIMARY KEY AUTO_INCREMENT,
   clinic_id INT NOT NULL,
   phone_number VARCHAR(15),
   street_address VARCHAR(150),
   city VARCHAR(50),
   state VARCHAR(50),
   zip_code VARCHAR(10),
   FOREIGN KEY (clinic_id) REFERENCES Clinic(clinic_id)
       ON DELETE CASCADE
       ON UPDATE CASCADE
);


CREATE TABLE Physician (
   physician_id INT PRIMARY KEY AUTO_INCREMENT,
   first_name VARCHAR(50) NOT NULL,
   last_name VARCHAR(50) NOT NULL,
   email VARCHAR(100) UNIQUE,
   phone_number VARCHAR(15),
   specialty VARCHAR(100),
   department_id INT,
   hire_date DATE,
   FOREIGN KEY (department_id) REFERENCES Department(department_id)
       ON DELETE SET NULL
       ON UPDATE CASCADE
);


CREATE TABLE Work_Schedule (
   schedule_id INT PRIMARY KEY AUTO_INCREMENT,
   physician_id INT NOT NULL,
   office_id INT NOT NULL,
   day_of_week VARCHAR(10),
   start_time TIME,
   end_time TIME,
   FOREIGN KEY (physician_id) REFERENCES Physician(physician_id)
       ON DELETE CASCADE
       ON UPDATE CASCADE,
   FOREIGN KEY (office_id) REFERENCES Office(office_id)
       ON DELETE CASCADE
       ON UPDATE CASCADE
);


CREATE TABLE Patient (
   patient_id INT PRIMARY KEY AUTO_INCREMENT,
   first_name VARCHAR(50) NOT NULL,
   last_name VARCHAR(50) NOT NULL,
   date_of_birth DATE,
   phone_number VARCHAR(15),
   email VARCHAR(100),
   street_address VARCHAR(150),
   city VARCHAR(50),
   state VARCHAR(50),
   zip_code VARCHAR(10),
   gender VARCHAR(20),
   emergency_contact_name VARCHAR(100),
   emergency_contact_phone VARCHAR(15),
   primary_physician_id INT,
   FOREIGN KEY (primary_physician_id) REFERENCES Physician(physician_id)
       ON DELETE SET NULL
       ON UPDATE CASCADE
);


CREATE TABLE Appointment (
   appointment_id INT PRIMARY KEY AUTO_INCREMENT,
   patient_id INT NOT NULL,
   physician_id INT NOT NULL,
   office_id INT NOT NULL,
   appointment_date DATE NOT NULL,
   appointment_time TIME NOT NULL,
   status VARCHAR(20),
   booking_method VARCHAR(20),
   reason_for_visit VARCHAR(255),
   FOREIGN KEY (patient_id) REFERENCES Patient(patient_id)
       ON DELETE CASCADE
       ON UPDATE CASCADE,
   FOREIGN KEY (physician_id) REFERENCES Physician(physician_id)
       ON DELETE CASCADE
       ON UPDATE CASCADE,
   FOREIGN KEY (office_id) REFERENCES Office(office_id)
       ON DELETE CASCADE
       ON UPDATE CASCADE
);


CREATE TABLE Referral (
   referral_id INT PRIMARY KEY AUTO_INCREMENT,
   patient_id INT NOT NULL,
   primary_physician_id INT NOT NULL,
   specialist_id INT NOT NULL,
   date_issued DATE,
   expiration_date DATE,
   status VARCHAR(20),
   referral_reason VARCHAR(255),
   FOREIGN KEY (patient_id) REFERENCES Patient(patient_id)
       ON DELETE CASCADE
       ON UPDATE CASCADE,
   FOREIGN KEY (primary_physician_id) REFERENCES Physician(physician_id)
       ON DELETE CASCADE
       ON UPDATE CASCADE,
   FOREIGN KEY (specialist_id) REFERENCES Physician(physician_id)
       ON DELETE CASCADE
       ON UPDATE CASCADE
);


CREATE TABLE Staff (
   staff_id INT PRIMARY KEY AUTO_INCREMENT,
   first_name VARCHAR(50),
   last_name VARCHAR(50),
   date_of_birth DATE,
   department_id INT,
   role VARCHAR(50),
   hire_date DATE,
   phone_number VARCHAR(15),
   email VARCHAR(100),
   shift_start TIME,
   shift_end TIME,
   FOREIGN KEY (department_id) REFERENCES Department(department_id)
       ON DELETE SET NULL
       ON UPDATE CASCADE
);


CREATE TABLE Treatment (
   treatment_id INT PRIMARY KEY AUTO_INCREMENT,
   appointment_id INT NOT NULL,
   diagnosis VARCHAR(255),
   treatment_plan TEXT,
   prescribed_medication VARCHAR(255),
   follow_up_date DATE,
   notes TEXT,
   FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id)
       ON DELETE CASCADE
       ON UPDATE CASCADE
);


CREATE TABLE Billing (
   bill_id INT PRIMARY KEY AUTO_INCREMENT,
   appointment_id INT NOT NULL UNIQUE,
   patient_id INT NOT NULL,
   total_amount DECIMAL(10,2),
   tax_amount DECIMAL(10,2),
   payment_status VARCHAR(20),
   payment_method VARCHAR(30),
   payment_date DATE,
   insurance_provider VARCHAR(100),
   FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id)
       ON DELETE CASCADE
       ON UPDATE CASCADE,
   FOREIGN KEY (patient_id) REFERENCES Patient(patient_id)
       ON DELETE CASCADE
       ON UPDATE CASCADE
);

