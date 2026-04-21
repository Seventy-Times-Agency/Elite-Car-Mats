"use client";

import { LegalLayout } from "@/components/legal/LegalLayout";
import { useT } from "@/i18n/I18nProvider";

export default function RefundPage() {
  const t = useT();
  return (
    <LegalLayout
      title={t("refund.title")}
      intro={t("refund.intro")}
      updatedAt={t("refund.updatedAt")}
    >
      <h2>{t("refund.windowH")}</h2>
      <p>
        {t("refund.windowPPre")}
        <strong>{t("refund.windowBold")}</strong>
        {t("refund.windowPPost")}
      </p>

      <h2>{t("refund.condH")}</h2>
      <ul>
        <li>
          {t("refund.cond1Pre")}
          <strong>{t("refund.cond1Bold")}</strong>
        </li>
        <li>{t("refund.cond2")}</li>
        <li>{t("refund.cond3")}</li>
      </ul>

      <h2>{t("refund.howH")}</h2>
      <ol>
        <li>
          {t("refund.howPre")}{" "}
          <a href="mailto:info@elitecarmats.us">info@elitecarmats.us</a>
          {t("refund.howPost")}
        </li>
        <li>{t("refund.how2")}</li>
        <li>{t("refund.how3")}</li>
        <li>{t("refund.how4")}</li>
      </ol>

      <h2>{t("refund.whoH")}</h2>
      <ul>
        <li>
          <strong>{t("refund.who1Bold")}</strong>
          {t("refund.who1")}
        </li>
        <li>
          <strong>{t("refund.who2Bold")}</strong>
          {t("refund.who2")}
        </li>
      </ul>

      <h2>{t("refund.exchangeH")}</h2>
      <p>{t("refund.exchangeP")}</p>

      <h2>{t("refund.refundsH")}</h2>
      <p>{t("refund.refundsP")}</p>

      <h2>{t("refund.notH")}</h2>
      <ul>
        <li>{t("refund.not1")}</li>
        <li>{t("refund.not2")}</li>
        <li>{t("refund.not3")}</li>
      </ul>

      <h2>{t("refund.damageH")}</h2>
      <p>
        {t("refund.damagePPre")}{" "}
        <a href="mailto:info@elitecarmats.us">info@elitecarmats.us</a>
        {t("refund.damagePPost")}
      </p>
    </LegalLayout>
  );
}
