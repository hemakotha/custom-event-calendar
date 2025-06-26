import { useState, useEffect } from 'react';

const EventModal = ({ selectedDate, onClose, onSave, existingEvents, setEvents }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [recurrenceType, setRecurrenceType] = useState('none');
  const [customInterval, setCustomInterval] = useState(2);
  const [recurrenceCount, setRecurrenceCount] = useState(3);
  const [conflictWarning, setConflictWarning] = useState('');

  useEffect(() => {
    setTitle('');
    setTime('');
    setDescription('');
    setEditIndex(null);
    setRecurrenceType('none');
    setCustomInterval(2);
    setRecurrenceCount(3);
    setConflictWarning('');
  }, [selectedDate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const event = {
      title,
      time,
      description,
      date: selectedDate,
    };

    const isConflict = existingEvents.some((e, idx) =>
      idx !== editIndex &&
      e.time === time &&
      new Date(e.date).toDateString() === selectedDate.toDateString()
    );

    if (isConflict) {
      setConflictWarning('⚠️ Event conflict: Another event is already scheduled at this time.');
      return;
    }

    if (editIndex !== null) {
      const updatedEvents = [...existingEvents];
      updatedEvents[editIndex] = event;
      setEvents((prev) =>
        prev.map((e) =>
          e.date.toDateString() === selectedDate.toDateString() &&
          e.title === existingEvents[editIndex].title &&
          e.time === existingEvents[editIndex].time
            ? event
            : e
        )
      );
    } else {
      const recurrence =
        recurrenceType === 'none'
          ? null
          : {
              type: recurrenceType,
              count: recurrenceCount,
              interval: recurrenceType === 'custom' ? customInterval : null,
            };
      onSave(event, recurrence);
    }

    onClose();
  };

  const handleEdit = (index) => {
    const event = existingEvents[index];
    setTitle(event.title);
    setTime(event.time);
    setDescription(event.description);
    setEditIndex(index);
    setConflictWarning('');
  };

  const handleDelete = (index) => {
    const eventToDelete = existingEvents[index];
    setEvents((prev) =>
      prev.filter(
        (e) =>
          !(
            e.date.toDateString() === selectedDate.toDateString() &&
            e.title === eventToDelete.title &&
            e.time === eventToDelete.time
          )
      )
    );
  };
const formatForGoogle = (dateObj, timeStr) => {
  const pad = (n) => (n < 10 ? '0' + n : n);
  const d = new Date(dateObj);
  let [hour, minute] = timeStr?.split(':') || ['09', '00'];
  const start = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${hour}${minute}00`;
  const endHour = String(parseInt(hour) + 1).padStart(2, '0');
  const end = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${endHour}${minute}00`;
  return `${start}/${end}`;
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50 overflow-y-auto py-10 px-2">
      <div className="bg-white p-6 rounded shadow-md w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-2">
          {editIndex !== null ? 'Edit' : 'Add'} Event for {selectedDate.toDateString()}
        </h2>

        {existingEvents?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Existing Events:</h3>
            <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
              {existingEvents.map((event, idx) => (
                <li key={idx} className="flex justify-between items-start">
                  <div className="w-64 truncate">
                    <strong>{event.time ? `${event.time} -` : ''}</strong> {event.title}
                    {event.description && `: ${event.description}`}
                  </div>
                 <div className="ml-2 flex flex-col gap-1 items-end">
  <div className="flex gap-2">
    <button onClick={() => handleEdit(idx)} className="text-blue-500 text-xs">✏️</button>
    <button onClick={() => handleDelete(idx)} className="text-red-500 text-xs">🗑️</button>
  </div>
</div>

                </li>
              ))}
            </ul>
          </div>
        )}

        {conflictWarning && (
          <p className="text-red-500 text-sm mb-2">{conflictWarning}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
          />

          {editIndex === null && (
            <>
              <label className="text-sm font-semibold block">Recurrence:</label>
              <select
                value={recurrenceType}
                onChange={(e) => setRecurrenceType(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom (e.g., every X days)</option>
              </select>

              {recurrenceType === 'custom' && (
                <input
                  type="number"
                  min={1}
                  value={customInterval}
                  onChange={(e) => setCustomInterval(Number(e.target.value))}
                  placeholder="Repeat every X days"
                  className="w-full p-2 border rounded"
                />
              )}

              {recurrenceType !== 'none' && (
                <input
                  type="number"
                  min={1}
                  value={recurrenceCount}
                  onChange={(e) => setRecurrenceCount(Number(e.target.value))}
                  placeholder="How many times to repeat?"
                  className="w-full p-2 border rounded"
                />
              )}
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              {editIndex !== null ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal; 


























