"use client";

import { LegalLayout } from "@/components/legal/LegalLayout";
import { useT } from "@/i18n/I18nProvider";

export default function TermsPage() {
  const t = useT();
  return (
    <LegalLayout
      title={t("terms.title")}
      intro={t("terms.intro")}
      updatedAt={t("terms.updatedAt")}
    >
      <h2>{t("terms.s1H")}</h2>
      <p>{t("terms.s1P")}</p>

      <h2>{t("terms.s2H")}</h2>
      <ul>
        <li>{t("terms.s2l1")}</li>
        <li>{t("terms.s2l2")}</li>
        <li>{t("terms.s2l3")}</li>
        <li>{t("terms.s2l4")}</li>
      </ul>

      <h2>{t("terms.s3H")}</h2>
      <p>{t("terms.s3P")}</p>

      <h2>{t("terms.s4H")}</h2>
      <p>
        {t("terms.s4PPre")}
        <a href="/refund">{t("terms.s4PLink")}</a>
        {t("terms.s4PPost")}
      </p>

      <h2>{t("terms.s5H")}</h2>
      <p>
        {t("terms.s5PPre")}
        <a href="/warranty">{t("terms.s5PLink")}</a>
        {t("terms.s5PPost")}
      </p>

      <h2>{t("terms.s6H")}</h2>
      <p>{t("terms.s6P1")}</p>
      <p>{t("terms.s6P2")}</p>

      <h2>{t("terms.s7H")}</h2>
      <p>{t("terms.s7P1")}</p>
      <p>{t("terms.s7P2")}</p>

      <h2>{t("terms.s8H")}</h2>
      <p>{t("terms.s8P")}</p>

      <h2>{t("terms.s9H")}</h2>
      <p>{t("terms.s9P")}</p>

      <h2>{t("terms.s10H")}</h2>
      <p>
        {t("terms.s10PPre")}
        <a href="mailto:info@elitecarmats.us">info@elitecarmats.us</a>
      </p>
    </LegalLayout>
  );
}
