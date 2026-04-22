import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AuthSession } from '../../types/auth'
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from "../../components/ui/input";
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'

type ContactPageProps = {
  session: AuthSession
}

type ContactFormState = {
  fullName: string
  email: string
  subject: string
  message: string
}

const initialState: ContactFormState = {
  fullName: '',
  email: '',
  subject: '',
  message: '',
}

export function ContactPage({ session }: ContactPageProps) {
  const [form, setForm] = useState<ContactFormState>(initialState)
  const [submitted, setSubmitted] = useState(false)

  const updateField =
    (field: keyof ContactFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setForm(initialState)
  }

  return (
    <main className="app-shell">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <p className="eyebrow">Contact</p>
          <CardTitle>Get in touch with UrbanFix</CardTitle>
          <CardDescription>
            Send us your service requirement and our team will respond shortly.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {submitted && (
            <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-200">
              Thanks! Your message has been captured successfully.
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={updateField('fullName')}
                placeholder="Kedar Dalvi"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={updateField('email')}
                placeholder="kedar@urbanfix.in"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={updateField('subject')}
                placeholder="Need electrician for inverter wiring at home"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={updateField('message')}
                placeholder="Please share your issue, preferred time, and locality (for example: Baner, Pune)."
                className="min-h-28"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Submit request
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <Link to="/">Back to home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={session.profile ? '/dashboard' : '/login'}>
              {session.profile ? 'Go to dashboard' : 'Login'}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
