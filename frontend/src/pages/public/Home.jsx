import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Shield, Users, Wrench } from 'lucide-react';
import Button from '../../components/common/Button';

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="navbar bg-primary text-primary-content px-6">
        <div className="flex-1"><Link to="/" className="text-xl font-bold">CivicConnect</Link></div>
        <div className="flex-none gap-2">
          <Link to="/login" className="btn btn-ghost">Login</Link>
          <Link to="/register" className="btn btn-secondary">Register</Link>
        </div>
      </div>

      <section className="hero min-h-[70vh] bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Report. Track. Resolve.</h1>
            <p className="py-6 text-lg text-neutral/80">
              CivicConnect connects citizens with municipal departments for faster complaint resolution.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/register"><Button>Get Started <ArrowRight size={16} /></Button></Link>
              <Link to="/about"><Button variant="outline">Learn More</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Departments We Serve</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Wrench, title: 'Road Maintenance', desc: 'Potholes, street damage, signage' },
            { icon: Building2, title: 'Sanitation', desc: 'Waste collection, cleanliness' },
            { icon: Shield, title: 'Water & Drainage', desc: 'Leaks, blockages, flooding' },
            { icon: Users, title: 'Electrical', desc: 'Street lights, power issues' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card bg-base-100 shadow border border-base-300">
              <div className="card-body items-center text-center">
                <Icon className="text-primary" size={32} />
                <h3 className="card-title text-base">{title}</h3>
                <p className="text-sm text-neutral/70">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-base-200">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
          <div className="steps steps-vertical lg:steps-horizontal w-full">
            <div className="step step-primary">Submit your complaint with photos & location</div>
            <div className="step step-primary">Track status in real-time</div>
            <div className="step step-primary">Get notified when resolved</div>
          </div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="stats stats-vertical lg:stats-horizontal shadow w-full max-w-4xl mx-auto bg-base-100">
          <div className="stat"><div className="stat-title">Complaints Resolved</div><div className="stat-value text-primary">12,450+</div></div>
          <div className="stat"><div className="stat-title">Active Workers</div><div className="stat-value text-secondary">320</div></div>
          <div className="stat"><div className="stat-title">Avg Resolution</div><div className="stat-value">48h</div></div>
        </div>
      </section>
    </div>
  );
}
