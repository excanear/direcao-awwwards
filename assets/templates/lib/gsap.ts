import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { DURATION, EASE, EASE_SVG_PATH } from "@/lib/motion";

// Single registration point: every client component imports GSAP from here.
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase);
CustomEase.create(EASE, EASE_SVG_PATH);
gsap.defaults({ ease: EASE, duration: DURATION.base });

export { gsap, ScrollTrigger, SplitText, useGSAP };
