"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Headphones,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    details: "support@marriagemedia.com",
    description: "We reply within 24 hours",
  },
  {
    icon: Phone,
    title: "Call Us",
    details: "+880 1700-000000",
    description: "Sat-Thu, 9AM - 6PM",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    details: "Dhaka, Bangladesh",
    description: "Gulshan-2, Dhaka 1212",
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: "Sat - Thu",
    description: "9:00 AM - 6:00 PM (BST)",
  },
];

const faqs = [
  {
    q: "How do I create a profile?",
    a: "Click on 'Register Free' and follow the simple registration process. You'll need a valid email address and a strong password.",
  },
  {
    q: "Is my personal information safe?",
    a: "Yes, we take privacy very seriously. Your data is encrypted and we never share it with third parties without your consent.",
  },
  {
    q: "How do I upgrade to Premium?",
    a: "Go to your Dashboard, click on 'Go Premium', and choose your preferred plan. We accept bKash, Nagad, and credit cards.",
  },
  {
    q: "How do I report a fake profile?",
    a: "Click the 'Report' button on any profile and select the reason. Our team will review it within 24 hours.",
  },
];

export default function ContactPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-rose-50 via-white to-pink-50 dark:from-rose-950/20 dark:via-background dark:to-pink-950/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4">
              <MessageCircle className="h-3.5 w-3.5 mr-1" />
              Contact Us
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Get in{" "}
              <span className="bg-linear-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions? We'd love to hear from you. Send us a message and we'll
              respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-3">
                      <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{info.title}</h3>
                    <p className="text-sm font-medium">{info.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              {isSubmitted ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input label="First Name" placeholder="Your first name" required />
                        <Input label="Last Name" placeholder="Your last name" required />
                      </div>
                      <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        required
                      />
                      <Input
                        label="Phone (Optional)"
                        type="tel"
                        placeholder="+880 1XXX-XXXXXX"
                      />
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          Subject
                        </label>
                        <select className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                          <option value="">Select a topic</option>
                          <option value="general">General Inquiry</option>
                          <option value="support">Technical Support</option>
                          <option value="billing">Billing Question</option>
                          <option value="report">Report an Issue</option>
                          <option value="partnership">Partnership</option>
                          <option value="feedback">Feedback</option>
                        </select>
                      </div>
                      <Textarea
                        label="Message"
                        placeholder="Tell us how we can help..."
                        rows={5}
                        required
                      />
                      <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            Send Message
                            <Send className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* FAQs */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index}>
                    <CardContent className="p-5">
                      <h3 className="font-semibold mb-2">{faq.q}</h3>
                      <p className="text-sm text-muted-foreground">{faq.a}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Support Card */}
              <Card className="mt-6 border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Headphones className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Need Immediate Help?</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Our support team is available during business hours for urgent inquiries.
                      </p>
                      <a
                        href="tel:+8801700000000"
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        Call +880 1700-000000 →
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}