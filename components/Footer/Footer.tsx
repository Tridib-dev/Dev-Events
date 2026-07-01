import FooterCTA from "./FooterCTA";
import FooterBrand from "./FooterBrand";
import FooterLinks from "./FooterLinks";
import FooterBottom from "./FooterBottom";

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-inner">
                <FooterCTA />

                <div className="footer-main">
                    <FooterBrand />
                    <FooterLinks />
                </div>

                <div className="footer-divider" />
                <FooterBottom />
            </div>
        </footer>
    );
};

export default Footer;