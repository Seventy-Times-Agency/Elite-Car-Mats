"use client";

import { LegalLayout } from "@/components/legal/LegalLayout";
import { useT } from "@/i18n/I18nProvider";

export default function WarrantyPage() {
  const t = useT();
  return (
    <LegalLayout
      title={t("warranty.title")}
      intro={t("warranty.intro")}
      updatedAt={t("warranty.updatedAt")}
    >
      <h2>{t("warranty.coversH")}</h2>
      <ul>
        <li>{t("warranty.c1")}</li>
        <li>{t("warranty.c2")}</li>
        <li>{t("warranty.c3")}</li>
        <li>{t("warranty.c4")}</li>
        <li>{t("warranty.c5")}</li>
      </ul>

      <h2>{t("warranty.notH")}</h2>
      <ul>
        <li>{t("warranty.n1")}</li>
        <li>{t("warranty.n2")}</li>
        <li>{t("warranty.n3")}</li>
        <li>{t("warranty.n4")}</li>
        <li>{t("warranty.n5")}</li>
      </ul>

      <h2>{t("warranty.periodH")}</h2>
      <p>
        <strong>{t("warranty.periodBold")}</strong>
        {t("warranty.periodP")}
      </p>

      <h2>{t("warranty.howH")}</h2>
      <ol>
        <li>{t("warranty.h1")}</li>
        <li>
          {t("warranty.h2Pre")}{" "}
          <a href="mailto:info@elitecarmats.us">info@elitecarmats.us</a>
          {t("warranty.h2Post")}
        </li>
        <li>{t("warranty.h3")}</li>
        <li>{t("warranty.h4")}</li>
        <li>{t("warranty.h5")}</li>
      </ol>

      <h2>{t("warranty.replaceH")}</h2>
      <p>{t("warranty.replaceP")}</p>

      <h2>{t("warranty.shipH")}</h2>
      <p>{t("warranty.shipP")}</p>
    </LegalLayout>
  );
}
