import { Logo, SocialLink, Tag, TEDX_DISCLAIMER } from "tedx-amsterdam-design-system";
import { BUILD_YEAR, DESIGN_CREDIT, FOOTER_NAV, LEGAL_ENTITY, SOCIAL_LINKS } from "@/config/site";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.columns}>
          <nav aria-labelledby="footer-menu" className={styles.column}>
            <Tag color="white" id="footer-menu">
              Menu
            </Tag>
            <ul className={styles.list}>
              {FOOTER_NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={styles.link}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.column}>
            <Tag color="white">Social media</Tag>
            <ul className={styles.list}>
              {SOCIAL_LINKS.map((social) => (
                <li key={social.network}>
                  <SocialLink
                    network={social.network}
                    label={social.label}
                    href={social.href}
                    base="/"
                    className={styles.social}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Logo href="/" base="/" className={styles.logo} />

        <ul className={styles.legal}>
          <li>{TEDX_DISCLAIMER}</li>
          <li>
            Copyright {LEGAL_ENTITY}, {BUILD_YEAR}
          </li>
          <li>All Rights Reserved</li>
          <li>
            <a href={DESIGN_CREDIT.href} className={styles.legalLink}>{DESIGN_CREDIT.label}</a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
