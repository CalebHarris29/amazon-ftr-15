import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RoboticArmAnimation } from '@/components/RoboticArmAnimation';
import { 
  Package, 
  Store, 
  LayoutDashboard, 
  ArrowRight, 
  ShieldCheck, 
  Bot, 
  Zap,
  Clock
} from 'lucide-react';
import heroImage from '@/assets/hero-robot.jpg';

const Landing = () => {
  return (
    <div className="min-h-screen gradient-hero">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Robotic inspection system"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>

        <div className="relative z-10 container mx-auto px-4 pt-20 pb-32">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Bot className="w-4 h-4" />
              AI-Powered Return Inspection
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Automated Smart
              <span className="text-gradient block mt-2">Returns Inspection</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Our robotic inspection system uses AI to detect fraud, verify authenticity, 
              and process returns within 72 hours. Protect your business with intelligent automation.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/customer">
                <Button variant="hero" size="xl">
                  <Package className="w-5 h-5" />
                  Customer Portal
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/seller">
                <Button variant="outline" size="xl">
                  <Store className="w-5 h-5" />
                  Seller Portal
                </Button>
              </Link>
              <Link to="/admin">
                <Button variant="secondary" size="xl">
                  <LayoutDashboard className="w-5 h-5" />
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our end-to-end automated inspection pipeline ensures accuracy and speed
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Package,
                title: 'Item Received',
                description: 'Return package enters the inspection queue automatically',
              },
              {
                icon: Bot,
                title: 'Robotic Scanning',
                description: 'High-precision robotic arm performs multi-angle inspection',
              },
              {
                icon: ShieldCheck,
                title: 'AI Analysis',
                description: 'Deep learning models detect damage and verify authenticity',
              },
              {
                icon: Zap,
                title: 'Instant Results',
                description: 'Fraud score generated and results delivered within 72 hours',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                See the Inspection in Action
              </h2>
              <p className="text-muted-foreground mb-8">
                Watch our robotic arm inspect packages in real-time. The AI system 
                analyzes damage patterns, verifies serial numbers, and generates 
                comprehensive fraud risk assessments.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Clock, text: 'Average inspection time: 45 seconds' },
                  { icon: ShieldCheck, text: '99.2% fraud detection accuracy' },
                  { icon: Zap, text: 'Results delivered within 72 hours' },
                ].map((stat, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium">{stat.text}</span>
                  </div>
                ))}
              </div>

              <Link to="/inspection" className="inline-block mt-8">
                <Button variant="accent" size="lg">
                  View Live Simulation
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="animate-float">
              <RoboticArmAnimation isScanning stage={2} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Returns Process?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Join leading retailers who have reduced fraud by 85% and cut 
            processing time by 60% with our AI-powered inspection system.
          </p>
          <Link to="/customer">
            <Button variant="accent" size="xl">
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
