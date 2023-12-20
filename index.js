const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000 || 5000;

app.use(bodyParser.json());

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

let rooms = [
    {
        room_id: 1,
        no_seats: 50,
        amenities_room: ["AC"],
        price_1hr: 900
    },
    {
        room_id: 2,
        no_seats: 30,
        amenities_room: ["AC"],
        price_1hr: 650
    },
    {
        room_id: 3,
        no_seats: 50,
        amenities_room: ["AC", "WiFi"],
        price_1hr: 1000
    },
    {
        room_id: 4,
        no_seats: 100,
        amenities_room: ["AC", "WiFi"],
        price_1hr: 1800
    },
];

let bookings = [
    {
        customer_name: "rahul",
        date: "15-12-2023",
        start_time: "08:00",
        end_time: "15:00",
        room_id: 3
    },
    {
        customer_name: "naresh",
        date: "18-12-2023",
        start_time: "10:00",
        end_time: "17:00",
        room_id: 1
    },
    {
        customer_name: "gopi",
        date: "15-12-2023",
        start_time: "09:00",
        end_time: "18:00",
        room_id: 4
    },
];

// Endpoint to create a room
app.post('/create-room', (req, res) => {
    const newRoom = req.body; // Assuming the request body contains room details
    rooms.push(newRoom);
    res.json({ message: 'Room created successfully', room: newRoom });
});

// Endpoint to book a room
app.post('/book-room', (req, res) => {
    const newBooking = req.body; // Assuming the request body contains booking details

    // Check if the room is available for booking on the specified date and time
    const isRoomAvailable = !bookings.some(booking =>
        booking.room_id === newBooking.room_id &&
        booking.date === newBooking.date &&
        (
            (booking.start_time >= newBooking.start_time && booking.start_time < newBooking.end_time) ||
            (booking.end_time > newBooking.start_time && booking.end_time <= newBooking.end_time) ||
            (booking.start_time <= newBooking.start_time && booking.end_time >= newBooking.end_time)
        )
    );

    if (isRoomAvailable) {
        bookings.push(newBooking);
        res.json({ message: 'Room booked successfully', booking: newBooking });
    } else {
        res.status(400).json({ error: 'Room is already booked for the specified date and time' });
    }
});

// Endpoint to list all rooms with booked data
app.get('/list-rooms', (req, res) => {
    // Implement logic to list all rooms with booked data

    const roomsWithBookings = rooms.map(room => {
        const roomBookings = bookings.filter(booking => booking.room_id === room.room_id);
        return {
            room_id: room.room_id,
            no_seats: room.no_seats,
            amenities_room: room.amenities_room,
            price_1hr: room.price_1hr,
            bookings: roomBookings,
        };
    });

    res.json(roomsWithBookings);
});

// Endpoint to list all customers with booked data
app.get('/list-customers', (req, res) => {
    // Implement logic to list all customers with booked data

    const customersWithBookings = bookings.reduce((acc, booking) => {
        const customer = acc.find(c => c.customer_name === booking.customer_name);

        if (customer) {
            customer.bookings.push({
                room_id: booking.room_id,
                date: booking.date,
                start_time: booking.start_time,
                end_time: booking.end_time,
            });
        } else {
            acc.push({
                customer_name: booking.customer_name,
                bookings: [{
                    room_id: booking.room_id,
                    date: booking.date,
                    start_time: booking.start_time,
                    end_time: booking.end_time,
                }],
            });
        }

        return acc;
    }, []);

    res.json(customersWithBookings);
});


// Endpoint to list how many times a customer has booked a room
app.get('/customer-booking-history/:customerName', (req, res) => {
    const customerName = req.params.customerName;
    const customerBookings = bookings.filter(booking => booking.customer_name === customerName);
    res.json({ customerName, bookingHistory: customerBookings });
});

