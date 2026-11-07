import HalftoneWordmarkFooterDemo from "@/components/halftone-wordmark-footer-demo";
import { brandifyFooterOptions } from "@/components/BrandifyHalftoneFooter";

/** Isolated full-screen preview for validating the effect before publication. */
export default function HalftoneFooterPreview() {
  return <HalftoneWordmarkFooterDemo {...brandifyFooterOptions} />;
}
