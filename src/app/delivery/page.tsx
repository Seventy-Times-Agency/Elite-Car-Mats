"use client";

import { LegalLayout } from "@/components/legal/LegalLayout";
import { useT } from "@/i18n/I18nProvider";
import { useShippingVars } from "@/context/PriceOverridesContext";

export default function DeliveryPage() {
  const t = useT();
  const ship = useShippingVars();
  return (
    <LegalLayout
      title={t("delivery.title")}
      intro={t("delivery.intro")}
      updatedAt={t("delivery.updatedAt")}
    >
      <h2>{t("delivery.timelinesH")}</h2>
      <ul>
        <li>
          <strong>{t("delivery.t1Pre")}</strong> {t("delivery.t1")}
        </li>
        <li>
          <strong>{t("delivery.t2Pre")}</strong> {t("delivery.t2")}
        </li>
        <li>
          <strong>{t("delivery.t3Pre")}</strong> {t("delivery.t3")}
        </li>
      </ul>

      <h2>{t("delivery.costH")}</h2>
      <ul>
        <li>
          <strong>{t("delivery.c1Pre", ship)}</strong> {t("delivery.c1", ship)}
        </li>
        <li>{t("delivery.c2")}</li>
        <li>{t("delivery.c3")}</li>
      </ul>

      <h2>{t("delivery.whereH")}</h2>
      <p>{t("delivery.whereP1")}</p>
      <p>
        {t("delivery.whereP2Pre")}{" "}
        <a href="mailto:info@elitecarmats.us">info@elitecarmats.us</a>
        {t("delivery.whereP2Post")}
      </p>

      <h2>{t("delivery.trackingH")}</h2>
      <p>
        {t("delivery.trackingP1")}{" "}
        <a href="/track">{t("delivery.trackingLink")}</a>
        {t("delivery.trackingP2")}
      </p>

      <h2>{t("delivery.packH")}</h2>
      <p>{t("delivery.packP")}</p>

      <h2>{t("delivery.missingH")}</h2>
      <p>{t("delivery.missingP1")}</p>
      <p>{t("delivery.missingP2")}</p>

      <h2>{t("delivery.remoteH")}</h2>
      <p>{t("delivery.remoteP")}</p>
    </LegalLayout>
  );
}
