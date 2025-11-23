"use client"

import { useEffect } from 'react'
import styles from './page.module.css'
s
export default function Landing() {
	const rooms = [
		{ id: 'A-101', title: 'ห้องสตูดิโอ สวยงาม', price: '฿3,500/เดือน', img: '/room1.jpg', available: true },
		{ id: 'B-203', title: 'ห้องมุม กว้าง', price: '฿3,800/เดือน', img: '/room2.jpg', available: false },
		{ id: 'A-105', title: 'ห้องวิวดี เงียบสงบ', price: '฿3,500/เดือน', img: '/room3.jpg', available: true },
		{ id: 'C-301', title: 'ห้องแกร่งพิเศษ', price: '฿4,200/เดือน', img: '/room4.jpg', available: false },
	]

	useEffect(() => {
		const els = document.querySelectorAll(`.${styles.reveal}`)
		if (!els || els.length === 0) return

		const obs = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					(entry.target as HTMLElement).classList.add(styles.visible)
					obs.unobserve(entry.target)
				}
			})
		}, { threshold: 0.12 })

		els.forEach(el => obs.observe(el))

		return () => obs.disconnect()
	}, [])

	return (
		<main className={styles.container}>
			{/* topbar with login */}
			<div className={styles.topbar}>
				<div className={styles.brand}>
					<div className={styles.brandLogo}>HS</div>
					<div className={styles.brandTitle}>HomeStay — หอพักเท่ ดุดัน</div>
				</div>
				<button className={styles.loginBtn}>ล็อกอิน</button>
			</div>

			{/* room stats */}
			<div className={styles.statsRow}>
				<div className={styles.statBox}>
					<div className={styles.statLabel}>จำนวนห้องทั้งหมด</div>
					<div className={styles.statValue}>{rooms.length}</div>
				</div>
				<div className={styles.statBox}>
					<div className={styles.statLabel}>ห้องว่าง</div>
					<div className={styles.statValue}>{rooms.filter(r => r.available).length}</div>
				</div>
				<div className={styles.statBox}>
					<div className={styles.statLabel}>ไม่ว่าง</div>
					<div className={styles.statValue}>{rooms.filter(r => !r.available).length}</div>
				</div>
			</div>
			<section className={styles.hero}>
				<div className={styles.overlay} />
				<div className={`${styles.heroContent} ${styles.reveal}`}>
					<h1 style={{fontSize: '40px', margin: 0}}>หอพักเท่ ดุดัน พร้อมชีวิตที่ง่ายขึ้น</h1>
					<p style={{marginTop: 12, fontSize: 18}}>เลือกห้องที่ใช่ สไตล์คุณ — ปลอดภัย ใกล้สิ่งอำนวยความสะดวก</p>
					<a className={styles.ctaBtn} href="#rooms">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14" stroke="rgba(4,16,36,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 5l7 7-7 7" stroke="rgba(4,16,36,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
						ค้นหาทันที
					</a>
				</div>
			</section>

			<section className={`${styles.section} ${styles.textCenter}`} id="rooms">
				<h2>ห้องแนะนำ</h2>
				<p className={styles.textCenter}>ตัวอย่างห้องที่ได้รับความนิยม สีสันสดใส ตกแต่งทันสมัย</p>

				<div className={styles.servicesGrid} style={{marginTop:24}}>
					{rooms.map((r, i) => (
						<div className={`${styles.serviceCard} ${styles.reveal} ${styles.fierce}`} key={r.id} style={{transitionDelay: `${i * 120}ms`}}>
							<div className="media" style={{height:140, borderRadius:8, background:`url(${r.img}) center/cover no-repeat`}} />
							<h3 style={{marginTop:12}}>{r.title}</h3>
							<div className="price" style={{marginTop:6}}>{r.price}</div>
							<div className={styles.cardAccent} aria-hidden="true" />
						</div>
					))}
				</div>
			</section>

			<section className={styles.section}>
				<div className={styles.textCenter}>
					<h2>บริการของเรา</h2>
					<p>อินเทอร์เน็ตความเร็วสูง, ทำความสะอาด, ระบบรักษาความปลอดภัย 24 ชั่วโมง และชุมชนที่เป็นมิตร</p>
				</div>
			</section>

			<section className={styles.contactSection}>
				<div className={`${styles.contactBox} ${styles.reveal}`}>
					<h3>ติดต่อเรา</h3>
					<p>โทร: 012-345-6789 • อีเมล: info@homestay.example</p>
				</div>
			</section>

			<section className={styles.mapSection}>
				<h3>ตำแหน่งแผนที่</h3>
				<iframe className={`${styles.map} ${styles.reveal}`} src="https://www.google.com/maps/embed?pb=!1m18!" aria-hidden="false" title="map" />
			</section>
      
			{/* Reveal-on-scroll logic */}
			{/** useEffect must run in client; it attaches IntersectionObserver to .reveal elements **/}
			{null}
		</main>
	)
}
