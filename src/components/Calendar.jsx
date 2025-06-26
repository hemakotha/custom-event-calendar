import { useEffect, useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  addDays
} from 'date-fns';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import EventModal from './EventModal';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [conflictWarning, setConflictWarning] = useState('');
  const [filterText, setFilterText] = useState('');
  const [isWeeklyView, setIsWeeklyView] = useState(false);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    const saved = localStorage.getItem('calendar-events');
    if (saved) {
      const parsed = JSON.parse(saved);
      const withDates = parsed.map(e => ({
        ...e,
        date: new Date(e.date),
      }));
      setEvents(withDates);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

  const generateCalendar = () => {
    const start = isWeeklyView ? startOfWeek(currentDate) : startOfWeek(startOfMonth(currentDate));
    const end = isWeeklyView ? addDays(start, 6) : endOfWeek(endOfMonth(currentDate));

    const day = new Date(start);
    const weeks = [];

    while (day <= end) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push({
          date: new Date(day),
          isCurrentMonth: isSameMonth(day, currentDate),
        });
        day.setDate(day.getDate() + 1);
      }
      weeks.push(week);
      if (isWeeklyView) break; // Only one week in weekly view
    }

    return weeks;
  };

  const weeks = generateCalendar();

  const goToNext = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + (isWeeklyView ? 7 : 30));
    setCurrentDate(next);
  };

  const goToPrev = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - (isWeeklyView ? 7 : 30));
    setCurrentDate(prev);
  };

  const openModal = (date) => {
    setSelectedDate(date);
    setConflictWarning('');
  };

  const closeModal = () => {
    setSelectedDate(null);
    setConflictWarning('');
  };

  const checkConflict = (newEvent) => {
    return events.some(
      (e) =>
        e.date.toDateString() === newEvent.date.toDateString() &&
        e.time === newEvent.time &&
        e.title !== newEvent.title
    );
  };

  const saveEvent = (event, recurrence) => {
    const newEvents = [];
    const repeatMap = { daily: 1, weekly: 7, monthly: 30 };

    if (recurrence?.type && recurrence.count) {
      const interval = recurrence.type === 'custom' ? recurrence.interval : repeatMap[recurrence.type];

      for (let i = 0; i < recurrence.count; i++) {
        const repeatedEvent = {
          ...event,
          date: new Date(event.date.getTime() + i * interval * 24 * 60 * 60 * 1000),
        };
        if (checkConflict(repeatedEvent)) {
          setConflictWarning('Warning: Recurring event conflict detected.');
        }
        newEvents.push(repeatedEvent);
      }
    } else {
      if (checkConflict(event)) {
        setConflictWarning('Warning: Event conflict detected.');
      }
      newEvents.push(event);
    }

    setEvents((prev) => [...prev, ...newEvents]);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const draggedEvent = events.find((_, idx) => idx === parseInt(result.draggableId));
    if (!draggedEvent) return;

    const newDate = new Date(result.destination.droppableId);
    const updatedEvent = { ...draggedEvent, date: newDate };

    if (checkConflict(updatedEvent)) {
      alert('Conflict detected! Cannot move event.');
      return;
    }

    const updatedEvents = [...events];
    updatedEvents[parseInt(result.draggableId)] = updatedEvent;
    setEvents(updatedEvents);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div className="flex gap-2">
          <button onClick={goToPrev} className="px-3 py-1 bg-gray-200 rounded">← Prev</button>
          <button onClick={goToNext} className="px-3 py-1 bg-gray-200 rounded">Next →</button>
        </div>
        <h2 className="text-xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
        <button
          onClick={() => setIsWeeklyView(!isWeeklyView)}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
         Switch to {isWeeklyView ? 'Monthly' : 'Weekly'} View
        </button>
      </div>

      <div className="mb-4 flex justify-center">
        <input
          type="text"
          placeholder="🔍 Search events..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="p-2 border rounded w-full max-w-md"
        />
      </div>

      {conflictWarning && (
        <div className="text-red-600 text-sm mb-2">{conflictWarning}</div>
      )}

      <div className="grid grid-cols-7 gap-px font-semibold text-center bg-gray-200 text-gray-700">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-2 bg-white">{day}</div>
        ))}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-7 gap-px bg-gray-200" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {weeks.flat().map(({ date, isCurrentMonth }, cellIdx) => {
            const dayEvents = events
              .map((e, idx) => ({ ...e, index: idx }))
              .filter((e) =>
                new Date(e.date).toDateString() === date.toDateString() &&
                (
                  e.title.toLowerCase().includes(filterText.toLowerCase()) ||
                  e.description?.toLowerCase().includes(filterText.toLowerCase())
                )
              );

            const isTodayDate = isToday(date);

            return (
              <Droppable droppableId={date.toString()} key={cellIdx}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    onClick={() => openModal(date)}
                    className={`h-32 overflow-y-auto border bg-white p-1 text-left cursor-pointer 
                      ${!isCurrentMonth && !isWeeklyView ? 'bg-gray-100 text-gray-400' : ''}
                      ${isTodayDate ? 'border-2 border-blue-500' : ''}`}
                  >
                    <div className="text-xs font-bold">{date.getDate()}</div>
                    <ul className="text-xs space-y-0.5">
                      {dayEvents.map((event, i) => (
                        <Draggable draggableId={String(event.index)} index={i} key={event.index}>
                          {(provided) => (
                            <li
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                              className="truncate text-blue-700 bg-blue-50 p-0.5 rounded mt-1"
                            >
                              • {event.title}
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {selectedDate && (
        <EventModal
          selectedDate={selectedDate}
          onClose={closeModal}
          onSave={saveEvent}
          setEvents={setEvents}
          existingEvents={events.filter(
            (e) => new Date(e.date).toDateString() === selectedDate.toDateString()
          )}
        />
      )}
    </div>
  );
};

export default Calendar;


















