"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/providers/language-provider";

const contactInfo = [
  { icon: Mail, title: "Email Us", detail: "support@marriagemedia.com", description: "We reply within 24 hours" },
  { icon: Phone, title: "Call Us", detail: "+880-1XXXXXXXXX", description: "Sat-Thu, 9AM-6PM" },
  { icon: MapPin, title: "Visit Us", detail: "Dhaka, Bangladesh", description: "By appointment only" },
  { icon: Clock, title: "Working Hours", detail: "Sat - Thu", description: "9:00 AM - 6:00 PM (BST)" },
];

export default function ContactContent() {
  const { translateText: text } = useLanguage();
  const [formData, setFormData] = React.useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch {
      console.error("Failed to send message");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-rose-50 via-white to-pink-50 dark:from-rose-950/20 dark:via-background dark:to-pink-950/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              {text("Get In")} <span className="bg-linear-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">{text("Touch")}</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              {text("Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" /> {text("Send a Message")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="text-center py-8">
                      <div className="mx-auto mb-4 p-3 rounded-full bg-emerald-500/10 w-fit">
                        <Send className="h-8 w-8 text-emerald-500" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{text("Message Sent!")}</h3>
                      <p className="text-muted-foreground">{text("Thank you for reaching out. We'll get back to you within 24 hours.")}</p>
                      <Button variant="outline" className="mt-4" onClick={() => setSubmitted(false)}>{text("Send Another")}</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">{text("Name")}</label>
                          <Input placeholder={text("Your name")} required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">{text("Email")}</label>
                          <Input type="email" placeholder="your@email.com" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">{text("Subject")}</label>
                        <Input placeholder={text("How can we help?")} required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">{text("Message")}</label>
                        <Textarea placeholder={text("Tell us more...")} rows={5} required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                      </div>
                      <Button type="submit" variant="gradient" className="w-full" disabled={submitting}>
                        {submitting ? text("Sending...") : text("Send Message")}
                        <Send className="h-4 w-4 ml-2" />
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
              {contactInfo.map((info) => (
                <Card key={info.title} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-primary/10">
                      <info.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{text(info.title)}</h3>
                      <p className="text-sm font-medium text-primary">{info.detail}</p>
                      <p className="text-xs text-muted-foreground">{text(info.description)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}