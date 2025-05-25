const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const db = require("../config/db");
const app = express();

// Export a function that accepts io
module.exports = function(io) {
  const router = express.Router();

  // Get all bookings (for admin or all users based on permission)
  router.get("/api/bookings", authenticateToken, async (req, res) => {
    try {
      // Check if user is admin
      const [adminCheck] = await db.execute(
        "SELECT is_admin FROM users WHERE id = ?",
        [req.user.id]
      );

      let bookings;
      if (adminCheck.length && adminCheck[0].is_admin) {
        // Admin: Fetch all bookings
        const [allBookings] = await db.execute(
          "SELECT b.*, u.email, u.name as user_name FROM bookings b LEFT JOIN users u ON b.user_id = u.id ORDER BY b.date DESC, b.time DESC"
        );
        bookings = allBookings;
      } else {
        // Regular user: Fetch their own bookings
        const [userBookings] = await db.execute(
          "SELECT * FROM bookings WHERE user_id = ? ORDER BY date DESC, time DESC",
          [req.user.id]
        );
        bookings = userBookings;
      }

      res.json(bookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Get admin bookings
  router.get("/admin", authenticateToken, async (req, res) => {
    try {
      const [adminCheck] = await db.execute(
        "SELECT is_admin FROM users WHERE id = ?",
        [req.user.id]
      );

      if (!adminCheck.length || !adminCheck[0].is_admin) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const [bookings] = await db.execute(
        "SELECT b.*, u.email, u.name as user_name FROM bookings b LEFT JOIN users u ON b.user_id = u.id ORDER BY b.date DESC, b.time DESC"
      );

      res.json(bookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Get user's bookings
  router.get("/user", authenticateToken, async (req, res) => {
    try {
      const [bookings] = await db.execute(
        "SELECT * FROM bookings WHERE user_id = ? ORDER BY date DESC, time DESC",
        [req.user.id]
      );

      res.json(bookings);
    } catch (err) {
      console.error("Error fetching user bookings:", err);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Create a new booking
  router.post("/", authenticateToken, async (req, res) => {
    console.log("Received Request Body:", req.body);

    const { name, email, phone, date, time, guests, specialRequest, table_id } = req.body;
    const tableId = table_id || 1;

    const userId = req.user?.id || null;
    const status = "pending";

    if (!name || !email || !phone || !date || !time) {
      return res.status(400).json({ error: "All fields are required except specialRequest." });
    }

    try {
      const [result] = await db.execute(
        "INSERT INTO bookings (user_id, table_id, date, time, customer_name, guests, specialRequest, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [userId, tableId, date, time, name, parseInt(guests), specialRequest || "", status]
      );

      const newBooking = {
        id: result.insertId,
        user_id: userId,
        table_id: tableId,
        date,
        time,
        customer_name: name,
        email,
        phone,
        guests: parseInt(guests),
        specialRequest: specialRequest || "",
        status,
        created_at: new Date()
      };

      // Create notification for admins
      try {
        await db.execute(
          "INSERT INTO notifications (type, booking_id, user_id, read_status, created_at) VALUES (?, ?, ?, ?, NOW())",
          ["new_booking", result.insertId, userId, 0]
        );
      } catch (notifErr) {
        console.error("Error creating notification:", notifErr);
        // Continue execution even if notification creation fails
      }

      // Emit booking to Socket.io clients
      io.emit('newBooking', newBooking);

      res.status(201).json({
        message: "Booking created successfully",
        bookingId: result.insertId,
      });
    } catch (err) {
      console.error("Error creating booking:", err);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // Update booking status
  router.put("/:id/status", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: "Valid status is required" });
    }

    try {
      const [adminCheck] = await db.execute(
        "SELECT is_admin FROM users WHERE id = ?",
        [req.user.id]
      );

      if (!adminCheck.length || !adminCheck[0].is_admin) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await db.execute(
        "UPDATE bookings SET status = ? WHERE id = ?",
        [status, id]
      );

      const [bookingDetails] = await db.execute(
        "SELECT user_id FROM bookings WHERE id = ?",
        [id]
      );

      if (bookingDetails.length > 0) {
        await db.execute(
          "INSERT INTO notifications (type, booking_id, user_id, read_status, created_at) VALUES (?, ?, ?, ?, NOW())",
          ["booking_updated", id, bookingDetails[0].user_id, 0]
        );
      }

      io.emit('bookingStatusUpdated', {
        id: parseInt(id),
        status
      });

      res.json({ message: "Booking status updated successfully" });
    } catch (err) {
      console.error("Error updating booking status:", err);
      res.status(500).json({ error: "Failed to update booking status" });
    }
  });

  // Delete booking
  router.delete("/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
      const [booking] = await db.execute(
        "SELECT user_id FROM bookings WHERE id = ?",
        [id]
      );

      if (booking.length === 0) {
        return res.status(404).json({ error: "Booking not found" });
      }

      const [adminCheck] = await db.execute(
        "SELECT is_admin FROM users WHERE id = ?",
        [req.user.id]
      );

      if (booking[0].user_id !== req.user.id && (!adminCheck.length || !adminCheck[0].is_admin)) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await db.execute("DELETE FROM bookings WHERE id = ?", [id]);

      await db.execute("DELETE FROM notifications WHERE booking_id = ?", [id]);

      io.emit('bookingDeleted', { id: parseInt(id) });

      res.json({ message: "Booking deleted successfully" });
    } catch (err) {
      console.error("Error deleting booking:", err);
      res.status(500).json({ error: "Failed to delete booking" });
    }
  });

  return router;
  
};