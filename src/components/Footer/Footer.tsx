
import "./Footer.css";

export default function Footer() {
	return (
		<footer className="home-footer">
			<div className="home-footer-container">
				<div className="home-footer-branding">
					<span className="home-footer-logo"><a href="#">ziganya</a></span>
					<div className="home-footer-bar" />
					<span className="home-footer-copyright">© 2026 Ziganya Finance</span>
				</div>
				<div className="home-footer-links">
					<a href="#" className="home-footer-link">Twitter</a>
					<a href="#" className="home-footer-link">Privacy</a>
					<a href="#" className="home-footer-link">Terms</a>
				</div>
			</div>
		</footer>
	);
}
