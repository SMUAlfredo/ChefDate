import { useState } from 'react'
import './App.css'

const cuisines = ['Italian', 'French', 'Mediterranean', 'Indian', 'Japanese', 'Mexican']
const services = [
  { id: 'cleanup', name: 'Kitchen cleanup', description: 'Leave the cooking space ready for tomorrow.', price: 40 },
  { id: 'table', name: 'Table setting', description: 'A thoughtfully prepared table for your guests.', price: 30 },
  { id: 'shopping', name: 'Grocery shopping', description: 'Let us take care of collecting ingredients.', price: 50 },
]
const money = (value) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(value)
const initial = { name: '', email: '', phone: '', address: '', city: '', region: '', country: 'Canada', postal: '', date: '', time: '', guests: '6', occasion: '', cuisines: ['Italian'], dietary: '', allergies: '', meal: 'Dinner', instructions: '', addons: [] }

function Field({ label, children, wide = false }) {
  return <label className={`field ${wide ? 'wide' : ''}`}><span>{label}</span>{children}</label>
}

function App() {
  const [page, setPage] = useState(1)
  const [form, setForm] = useState(initial)
  const [submitted, setSubmitted] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [card, setCard] = useState({ type: 'Visa', number: '', expiry: '' })
  const today = new Date()
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const estimate = Number(form.guests || 0) * 85 + services.filter((service) => form.addons.includes(service.id)).reduce((total, service) => total + service.price, 0)
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const go = (next) => { setPage(next); window.scrollTo({ top: 0, behavior: 'instant' }) }
  const toggle = (key, value) => setForm({ ...form, [key]: form[key].includes(value) ? form[key].filter((item) => item !== value) : [...form[key], value] })
  const input = (name, props = {}) => <input name={name} value={form[name]} onChange={update} required {...props} />

  function review(event) {
    event.preventDefault()
    if (!form.cuisines.length) return
    if (new Date(`${form.date}T${form.time}`) <= new Date()) {
      event.currentTarget.elements.time.setCustomValidity('Choose an event date and time in the future.')
      event.currentTarget.elements.time.reportValidity()
      return
    }
    go(2)
  }

  function submit(event) {
    event.preventDefault()
    const number = card.number.replace(/[\s-]/g, '')
    const formats = { Visa: /^4\d{12}(\d{3})?(\d{3})?$/, MasterCard: /^(5[1-5]\d{14}|(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)\d{12})$/, 'American Express': /^3[47]\d{13}$/ }
    if (!formats[card.type].test(number)) {
      setPaymentError(`Enter a valid simulated ${card.type} number.`)
      return
    }
    let sum = 0
    for (let i = number.length - 1, double = false; i >= 0; i--, double = !double) {
      let digit = Number(number[i])
      if (double) { digit *= 2; if (digit > 9) digit -= 9 }
      sum += digit
    }
    if (sum % 10 !== 0) { setPaymentError('Check the simulated card number.'); return }
    const [month, year] = card.expiry.split('/').map(Number)
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry) || new Date(2000 + year, month, 1) <= new Date()) {
      setPaymentError('Enter a current or future expiry date in MM/YY format.')
      return
    }
    setPaymentError('')
    setCard({ type: 'Visa', number: '', expiry: '' })
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <>
      <header className="site-header"><div className="header-inner"><a className="brand" href="#" onClick={(event) => { event.preventDefault(); if (!submitted) go(1) }}><span className="brand-mark" aria-hidden="true">c.</span>ChefDate<span className="brand-dot">.</span></a><span className="demo-label">Frontend demo</span></div></header>
      <main className="shell">
        <nav className="steps" aria-label="Booking steps"><button className={page === 1 ? 'step active' : 'step'} onClick={() => !submitted && go(1)} disabled={submitted}><span>01</span> Your experience</button><span className="step-line" /><span className={page === 2 ? 'step active' : 'step'} aria-current={page === 2 ? 'step' : undefined}><span>02</span> Review & request</span></nav>
        <div className="intro"><p className="eyebrow">A SEAT AT YOUR OWN TABLE</p><h1>{submitted ? 'Your request, ready for review.' : page === 1 ? 'Good food. Your place.' : 'A lovely evening starts here.'}</h1><p>{submitted ? 'This is a sample acknowledgement. No booking has been saved or sent.' : page === 1 ? 'Tell us what you have in mind. We’ll find the right chef for your occasion.' : 'Review your experience and complete the simulated checkout.'}</p></div>
        <div className="booking-layout">
          <div>
            {page === 1 ? <form onSubmit={review} onInput={(event) => event.currentTarget.elements.time.setCustomValidity('')}>
              <section className="panel"><div className="section-heading"><span className="section-number">01</span><div><h2>Your event</h2><p>The when, where, and who.</p></div></div>
                <div className="fields">
                  <Field label="Full name *">{input('name', { autoComplete: 'name', placeholder: 'Alex Morgan', maxLength: 100, pattern: "[\\p{L}][\\p{L} .’'\\-]*", title: 'Use letters, spaces, apostrophes, periods, or hyphens.' })}</Field>
                  <Field label="Email address *">{input('email', { type: 'email', autoComplete: 'email', placeholder: 'alex@example.com' })}</Field>
                  <Field label="Phone number *">{input('phone', { type: 'tel', autoComplete: 'tel', placeholder: '(902) 555-0123', pattern: '(\\+?1[ .-]?)?\\(?[2-9][0-9]{2}\\)?[ .-]?[0-9]{3}[ .-]?[0-9]{4}', title: 'Enter a 10-digit Canadian or US phone number, optionally prefixed with +1.' })}</Field>
                  <Field label="Occasion (optional)">{input('occasion', { required: false, placeholder: 'Birthday, dinner with friends…' })}</Field>
                  <Field label="Service address *" wide>{input('address', { autoComplete: 'street-address', placeholder: '123 Spring Street' })}</Field>
                  <Field label="City *">{input('city', { autoComplete: 'address-level2', placeholder: 'Halifax', pattern: "[\\p{L}][\\p{L} .’'\\-]*", title: 'Use letters, spaces, apostrophes, periods, or hyphens.' })}</Field>
                  <Field label="Country *"><select name="country" value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value, region: '', postal: '' })}><option>Canada</option><option>United States</option></select></Field>
                  <Field label={form.country === 'Canada' ? 'Province *' : 'State *'}>{input('region', { autoComplete: 'address-level1', placeholder: form.country === 'Canada' ? 'Nova Scotia' : 'New York', pattern: '[\\p{L} .\\-]+', title: 'Use letters, spaces, periods, or hyphens.' })}</Field>
                  <Field label={form.country === 'Canada' ? 'Postal code *' : 'ZIP code *'}>{input('postal', { autoComplete: 'postal-code', placeholder: form.country === 'Canada' ? 'B3H 1A1' : '10001', pattern: form.country === 'Canada' ? '[ABCEGHJ-NPRSTVXYabceghj-nprstvxy][0-9][ABCEGHJ-NPRSTV-Zabceghj-nprstv-z] ?[0-9][ABCEGHJ-NPRSTV-Zabceghj-nprstv-z][0-9]' : '[0-9]{5}(-[0-9]{4})?', title: form.country === 'Canada' ? 'Enter a Canadian postal code, such as B3H 1A1.' : 'Enter a 5-digit ZIP or ZIP+4 code.' })}</Field>
                  <Field label="Event date *">{input('date', { type: 'date', min: minDate })}</Field>
                  <Field label="Start time *">{input('time', { type: 'time', onChange: (event) => { event.target.setCustomValidity(''); update(event) } })}</Field>
                  <Field label="Number of guests *">{input('guests', { type: 'number', min: 1, max: 50, step: 1 })}</Field>
                  <Field label="Meal preference *"><select name="meal" value={form.meal} onChange={update}><option>Dinner</option><option>Lunch</option><option>Brunch</option></select></Field>
                </div>
              </section>
              <section className="panel"><div className="section-heading"><span className="section-number">02</span><div><h2>Make it your own</h2><p>A few details to help us find your fit.</p></div></div>
                <fieldset className="cuisine-field"><legend>Preferred cuisines * <span>Choose one or more</span></legend><div className="cuisine-options">{cuisines.map((cuisine) => <label className={`cuisine ${form.cuisines.includes(cuisine) ? 'selected' : ''}`} key={cuisine}><input type="checkbox" checked={form.cuisines.includes(cuisine)} onChange={() => toggle('cuisines', cuisine)} />{cuisine}</label>)}</div>{!form.cuisines.length && <p className="error" role="alert">Choose at least one cuisine before continuing.</p>}</fieldset>
                <div className="fields"><Field label="Dietary requirements (optional)">{input('dietary', { required: false, placeholder: 'Vegetarian, halal…' })}</Field><Field label="Allergies (optional)">{input('allergies', { required: false, placeholder: 'Nuts, shellfish…' })}</Field><Field label="Menu preferences & special instructions (optional)" wide><textarea name="instructions" value={form.instructions} onChange={update} rows={3} placeholder="Tell us about favourite dishes or anything else we should know." /></Field></div>
                <p className="fine-print">Preferences are subject to chef availability and confirmation.</p>
              </section>
              <section className="panel"><div className="section-heading"><span className="section-number">03</span><div><h2>A little extra help</h2><p>Optional services for your event.</p></div></div><div className="services">{services.map((service) => <label className="service" key={service.id}><input type="checkbox" checked={form.addons.includes(service.id)} onChange={() => toggle('addons', service.id)} /><span><strong>{service.name}</strong><small>{service.description}</small></span><span className="service-price">+{money(service.price)}</span></label>)}</div><p className="fine-print">Demo service options. Availability is checked before confirmation.</p></section>
              <div className="form-actions"><span>* Required fields</span><button className="primary" type="submit">Review your request <span aria-hidden="true">→</span></button></div>
            </form> : <>
              {submitted && <section className="acknowledgement" role="status"><span className="status-pill">Pending assignment · demo</span><h2>Thank you, {form.name.split(' ')[0]}.</h2><p>In the complete service, the team would review your preferences and check availability before assigning a chef. This preview does not confirm a booking or take payment.</p></section>}
              <section className="panel"><div className="review-heading"><h2>Your dining experience</h2>{!submitted && <button className="text-button" onClick={() => go(1)}>Edit details</button>}</div><dl className="review-grid"><div><dt>WHEN</dt><dd>{new Date(`${form.date}T12:00:00`).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })} · {form.time}</dd></div><div><dt>AT THE TABLE</dt><dd>{form.guests} guests · {form.meal}</dd></div><div className="wide"><dt>WHERE</dt><dd>{form.address}, {form.city}, {form.region}, {form.postal}, {form.country}</dd></div><div><dt>CUISINE</dt><dd>{form.cuisines.join(', ')}</dd></div><div><dt>OCCASION</dt><dd>{form.occasion || 'Not specified'}</dd></div><div><dt>DIETARY REQUIREMENTS</dt><dd>{form.dietary || 'None specified'}</dd></div><div><dt>ALLERGIES</dt><dd>{form.allergies || 'None specified'}</dd></div><div className="wide"><dt>SPECIAL INSTRUCTIONS</dt><dd>{form.instructions || 'None specified'}</dd></div><div className="wide"><dt>OPTIONAL SERVICES</dt><dd>{services.filter((service) => form.addons.includes(service.id)).map((service) => service.name).join(', ') || 'No add-ons selected'}</dd></div></dl><div className="contact-summary"><strong>{form.name}</strong><span>{form.email} · {form.phone}</span></div></section>
              {!submitted && <form className="panel" onSubmit={submit}><div className="section-heading"><span className="section-number">04</span><div><h2>Simulated checkout</h2><p>For demonstration only. No payment is processed.</p></div></div><div className="payment-note">Use test details only. Visa: 4111 1111 1111 1111 · MasterCard: 5555 5555 5555 4444 · Amex: 3782 822463 10005. Choose a future expiry date.</div><div className="fields"><Field label="Card type *"><select required value={card.type} onChange={(event) => setCard({ ...card, type: event.target.value })}><option>Visa</option><option>MasterCard</option><option>American Express</option></select></Field><Field label="Expiry date *"><input required value={card.expiry} onChange={(event) => setCard({ ...card, expiry: event.target.value })} placeholder="MM/YY" maxLength={5} inputMode="numeric" /></Field><Field label="Simulated card number *" wide><input required value={card.number} onChange={(event) => setCard({ ...card, number: event.target.value })} placeholder="4111 1111 1111 1111" maxLength={23} inputMode="numeric" autoComplete="off" /></Field></div>{paymentError && <p className="error" role="alert">{paymentError}</p>}<p className="fine-print">Your chef and final price are confirmed only after review. This demo keeps form details in memory until the page is refreshed.</p><button type="submit" className="primary submit">Preview request submission <span aria-hidden="true">→</span></button></form>}
            </>}
          </div>
          <aside className="summary"><div className="summary-top"><span className="eyebrow">YOUR EXPERIENCE</span><span className="summary-symbol" aria-hidden="true">✳</span></div><h2>A private chef.<br />A table of your own.</h2><p>Made around your tastes, in the comfort of your home.</p><div className="summary-detail"><span>Your gathering</span><strong>{form.guests || 0} guests · {form.meal.toLowerCase()}</strong></div><div className="estimate"><span>Estimated total</span><strong>{money(estimate)}</strong><small>CAD · Sample pricing: $85 per guest, plus selected services. Final price subject to confirmation.</small></div><div className="assignment-note"><span aria-hidden="true">↗</span><p><strong>We’ll find your chef.</strong> A chef is assigned after your request is reviewed and availability is checked.</p></div></aside>
        </div>
      </main>
      <footer><span className="footer-brand">ChefDate.</span><span>A personal dining experience, thoughtfully arranged.</span><span>Presentation demo · No bookings or charges</span></footer>
    </>
  )
}

export default App
