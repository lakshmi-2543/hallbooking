console.log("HallbookingAPI");
// import express from "express";
const express = require("express");
const app = express();
app.use(express.json());

const room = [{
    "roomID": "R101",
    "pricePerHr":100,
    "seats":50,
    "amenities": {"TV":true, 
    "AC":false,
     "lift":true, 
     "heater":true, 
     "pool":false,
    "gym":true}
},
{
    "roomID": "R102",
    "pricePerHr":200,
    "seats":75,
    "amenities": {"TV":true, 
    "AC":false,
     "lift":true, 
     "heater":true, 
     "pool":false,
    "gym":true}
},{
    "roomID": "R103",
    "pricePerHr":400,
    "seats":150,
    "amenities": {"TV":true, 
    "AC":true,
     "lift":true, 
     "heater":true, 
     "pool":true,
    "gym":true}
}];

const booking = [{
    "bookingID":"B1",
    "roomID":"R102",
    "customer":"Raji",
    "bookingDate":"20230725",
    "startTime": "12noon",
    "endTime": "11:59am",
    "status":"expired",
    "booked_On": "15/07/2023"
},{
    "bookingID":"B2",
    "roomID":"R101",
    "customer":"Mani",
    "bookingDate":"20230728",
    "startTime": "12noon",
    "endTime": "11:59am",
    "status":"expired",
    "booked_On": "01/07/2023"
},
{
    "bookingID":"B3",
    "roomID":"R101",
    "customer":"Ravi",
    "bookingDate":"20230721",
    "startTime": "12noon",
    "endTime": "11:59am",
    "status":"booked",
    "booked_On": "18/07/2023"
},
{
    "bookingID":"B4",
    "roomID":"R101",
    "customer":"Keerthi",
    "bookingDate":"20230730",
    "startTime": "12noon",
    "endTime": "11:59am",
    "status":"booked",
    "booked_On": "02/07/2023"
}];

// view all Rooms and its details
app.get('/room/all', function (req, res) {
  res.status(200).json({RoomsList : room});
})

// create a Room
app.get("/room/create", (req,res)=>{
    let addRoom = req.body;
    let idExists = room.find((el)=> el.roomID === addRoom.roomID)
    if(idExists !== undefined){
        return res.status(400).json({message:"room already exists.", RoomsList:room});

    }
    else{
    room.push(addRoom);
    res.status(201).json({message:"room created", RoomsList:room, added:addRoom});
    }
}) 

// view all bookings and its details - metion query param status to get past and current bookings 
app.get('/booking/all', function (req, res) { 
    const {status} = req.query;
    if(req.query && status === "booked"){
      let booked = booking.filter((el)=> el.status==="booked");
      res.status(200).json({BookingList : booked});
    }
    else if(req.query && status === "expired"){
        let expired = booking.filter((el)=> el.status==="expired");
        res.status(200).json({BookingList : expired});
    }
    else
    res.status(200).json({BookingList : booking});
})

// book a Room
app.post("/booking/create/:id", (req,res)=>{
  try{
    const {id} = req.params;
    let bookRoom = req.body; 
    let date = new Date();
    let dateFormat = date.toLocaleDateString();
    // console.log(dateFormat);
    // console.log(id);
    // console.log(bookRoom); 
    let idExists = room.find((el)=> el.roomID === id)
    if(idExists === undefined){
        return res.status(400).json({message:"room does not exist.", RoomsList:room, Bookings:booking});

    }
    let matchID = booking.filter((b)=> b.roomID===id) 
    //console.log("matching",matchID, "bookings",booking);
    if(matchID.length > 0){
        let dateCheck = matchID.filter((m)=>{ return m.bookingDate === bookRoom.bookingDate});
       // console.log("datematch",dateCheck,"booked",booking);
        if(dateCheck.length===0){
            let newID = "B"+(booking.length + 1);
            let newbooking = {...bookRoom, bookingID: newID, roomID:id, status:"booked", booked_On: dateFormat}
            booking.push(newbooking);
            return res.status(201).json({message:"hall booked", Bookings:booking, added:newbooking});
        }
        else{
            return res.status(400).json({message:"hall already booked for this date, choose another hall", Bookings:booking});
        }
    }
    else{
            let newID = "B"+(booking.length + 1);
            let newbooking = {...bookRoom, bookingID: newID, roomID:id, status:"booked",booked_On: dateFormat}
            booking.push(newbooking);
            return res.status(201).json({message:"hall booked", Bookings:booking, added:newbooking});

    }
    }
    catch(err){
    res.status(400).json({message:"error booking room", error: err, data:booking});
    }
}) 

// view all customers and details
app.get('/customers/all', function (req, res) { 
    const {status} = req.query;
    if(req.query && status === "expired"){
        let expired = booking.map((el)=> {
            if(el.status === "expired"){
                return {"customer_Name" : el.customer,
                        "room_Name": el.roomID,
                        "Date" : el.bookingDate,
                        "Start_Time": el.startTime,
                         "End_Time": el.endTime}
            }
        }) 
        expired = expired.filter((el) => el != null);
        res.status(200).json({Old_Customers : expired});
    }
    else{
    let customers = booking.map((el)=> {
        if(el.status === "booked"){
            return {"customer_Name" : el.customer,
                    "room_Name": el.roomID,
                    "Date" : el.bookingDate,
                    "Start_Time": el.startTime,
                     "End_Time": el.endTime}
        }
    }) 
    customers = customers.filter((el) => el != null);
    //console.log(customers);
    res.status(200).json({CustomerList : customers});
   }
}) 

    // view a particular customers and their booking details
app.get('/customers/find/:name', function (req, res) { 
    const {name} = req.params;
    let customer = booking.filter((el)=> el.customer.toLowerCase() === name.toLowerCase())
    if(customer.length > 0){
    customer = customer.map((el)=> {
            return {"customer_Name" : el.customer,
                    "room_Name": el.roomID,
                    "Date" : el.bookingDate,
                    "Start_Time": el.startTime,
                     "End_Time": el.endTime,
                    "Booking_ID": el.bookingID,
                    "Date_of_booking": el.booked_On,
                    "Booking_status":el.status
                   }
    }) 
    res.status(200).json({No_of_bookings: customer.length, list_bookings : customer});
    }
    else{
    res.status(400).json({message: "No bookings found for the specified customer name"});
    }
})
//listen and start a http server in specific port 
app.listen(9000, ()=> console.log("started server 9000 hallbooking"));