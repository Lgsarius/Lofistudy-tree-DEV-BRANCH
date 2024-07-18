// pages/contact.js

import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Contact() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = new FormData(form);
        const response = await fetch(form.action, {
            method: form.method,
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            setStatus('SUCCESS');
            setName('');
            setEmail('');
            setMessage('');
        } else {
            setStatus('ERROR');
        }
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Contact - Lo-Fi Study</title>
                <meta name="description" content="Get in touch with us at Lo-Fi Study" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
           

            <main className={styles.main}>
                <section className={styles.contactSection}>
                    <h1 className={styles.title}>Contact Us</h1>
                    <form
                        onSubmit={handleSubmit}
                        action="https://formspree.io/f/mqazannj"
                        method="POST"
                        className={styles.contactForm}
                    >
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className={styles.submitButton}>Send Message</button>
                        {status === 'SUCCESS' && <p className={styles.successMessage}>Thanks! Your message has been sent.</p>}
                        {status === 'ERROR' && <p className={styles.errorMessage}>Oops! There was an error.</p>}
                    </form>
                </section>
            </main>

            <footer className={styles.footer}>
    <p>© 2024 Lo-Fi.Study App. All rights reserved.</p>
    <ul>
            <li><Link href="/legal">Legal</Link></li>
            <li><Link href="/data">Data Policy</Link></li>
            <li><Link href="/contact">Contact</Link></li>
        </ul>
</footer>
        </div>
    );
}
