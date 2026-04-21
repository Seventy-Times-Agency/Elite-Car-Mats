"use client";

import { LegalLayout } from "@/components/legal/LegalLayout";
import { useT } from "@/i18n/I18nProvider";

export default function PrivacyPage() {
  const t = useT();
  return (
    <LegalLayout
      title={t("privacy.title")}
      intro={t("privacy.intro")}
      updatedAt={t("privacy.updatedAt")}
    >
      <h2>{t("privacy.s1H")}</h2>
      <p>{t("privacy.s1P1")}</p>
      <p>{t("privacy.s1P2")}</p>

      <h2>{t("privacy.s2H")}</h2>
      <ul>
        <li>{t("privacy.s2l1")}</li>
        <li>{t("privacy.s2l2")}</li>
        <li>{t("privacy.s2l3")}</li>
        <li>{t("privacy.s2l4")}</li>
      </ul>
      <p>
        {t("privacy.s2PPre")}
        <strong>{t("privacy.s2PBold")}</strong>
        {t("privacy.s2PPost")}
      </p>

      <h2>{t("privacy.s3H")}</h2>
      <p>{t("privacy.s3P")}</p>

      <h2>{t("privacy.s4H")}</h2>
      <p>
        {t("privacy.s4PPre")}
        <strong>{t("privacy.s4PBold")}</strong>
        {t("privacy.s4PPost")}
      </p>

      <h2>{t("privacy.s5H")}</h2>
      <p>
        {t("privacy.s5P1Pre")}
        <a href="mailto:info@elitecarmats.us">info@elitecarmats.us</a>
        {t("privacy.s5P1Post")}
      </p>
      <p>{t("privacy.s5P2")}</p>

      <h2>{t("privacy.s6H")}</h2>
      <p>{t("privacy.s6P")}</p>

      <h2>{t("privacy.s7H")}</h2>
      <p>{t("privacy.s7P")}</p>

      <h2>{t("privacy.s8H")}</h2>
      <p>
        {t("privacy.s8P")}
        <a href="mailto:info@elitecarmats.us">info@elitecarmats.us</a>
      </p>
    </LegalLayout>
  );
}
