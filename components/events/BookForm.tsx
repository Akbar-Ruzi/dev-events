import BookEvent from './BookEvent';

const BookingForm = () => {
    const bookings = 10;
    return (
        <aside className='booking'>
            <div className='signup-card'>
                <h2>Book Your Spot</h2>
                {bookings > 0 ? (
                    <p className='text-sm'>
                        Join {bookings} people who have already booked their spot!
                    </p>
                ) : (
                    <p className='text-sm'>Be the first to book your spot!</p>
                )}
                <BookEvent />
            </div>
        </aside>
    )
}

export default BookingForm