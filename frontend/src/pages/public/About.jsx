import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen">
      <div className="navbar bg-primary text-primary-content px-6">
        <Link to="/" className="text-xl font-bold">CivicConnect</Link>
      </div>
      <div className="max-w-3xl mx-auto p-8 prose">
        <h1>About CivicConnect</h1>
        <p>CivicConnect is a Smart Municipal Complaint Management System that bridges citizens and local government departments.</p>
        <p>Our platform enables transparent tracking, real-time updates, and efficient worker assignment across Road Maintenance, Sanitation, Water & Drainage, and Electrical departments.</p>
        <Link to="/" className="btn btn-primary mt-4">Back Home</Link>
      </div>
    </div>
  );
}
