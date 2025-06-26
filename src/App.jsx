import Calendar from './components/Calendar';

function App() {
  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/background1.jpg')" }}
    >
      <h1 className="text-3xl font-bold text-center py-6 text-white bg-black bg-opacity-50">
        🗓️ Custom Event Calendar
      </h1>
      <Calendar />
    </div>
  );
}

export default App;




