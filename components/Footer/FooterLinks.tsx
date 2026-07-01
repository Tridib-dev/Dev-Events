import { FOOTER_COLUMNS } from "@/lib/constants/footer-data";
import Link from "next/link";


const FooterLinks = () => {
    return (
        <div className="footer-links-grid">
            {FOOTER_COLUMNS.map((column) => (
                <div key={column.heading} className="footer-links-column">
                    <p className="footer-links-heading">{column.heading}</p>
                    <ul>
                        {column.links.map((link) => (
                            <li key={link.label}>
                                {link.soon ? (
                                    <span
                                        className="footer-link footer-link-soon"
                                        title="Coming soon"
                                        aria-label={`${link.label} — coming soon`}
                                    >
                                        {link.label}
                                    </span>
                                ) : (
                                    <Link href={link.href} className="footer-link">
                                        {link.label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default FooterLinks;