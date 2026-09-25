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
import { defaultManagedSections, sectionValue, useManagedPage } from "@/components/seo/managed-page-content";

const contactIcons = { email: Mail, phone: Phone, address: MapPin, hours: Clock };

export default function ContactContent() {
  const { language, translateText: text } = useLanguage();
  const { sections } = useManagedPage("contact");
  const managed = sections.length ? sections : defaultManagedSections("contact");
  const hero = sectionValue(managed, "hero", defaultManagedSections("contact")[0]);
  const contactInfo = managed
    .filter((section) => ["email", "phone", "address", "hours"].includes(section.id))
    .filter((section) => section.visible)
    .map((section) => {
      const item = section.items[0];
      return {
        icon: contactIcons[section.id as keyof typeof contactIcons] || Mail,
        title: language === "bn" ? section.titleBn || section.title : section.titleEn || section.title,
        detail: language === "bn" ? section.descriptionBn || section.description : section.descriptionEn || section.description,
        description: language === "bn" ? item?.titleBn || item?.title || "" : item?.titleEn || item?.title || "",
      };
    });
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
      {hero.visible ? <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-rose-50 via-white to-pink-50 dark:from-rose-950/20 dark:via-background dark:to-pink-950/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              {text(language === "bn" ? hero.titleBn || hero.title : hero.titleEn || hero.title)}
            </h1>
            <p className="text-lg text-muted-foreground">
              {text(language === "bn" ? hero.descriptionBn || hero.description : hero.descriptionEn || hero.description)}
            </p>
          </motion.div>
        </div>
      </section> : null}

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
