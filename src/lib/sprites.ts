import heroCarbo from "@/assets/hero-carbo.png";
import heroProt from "@/assets/hero-prot.png";
import heroLipid from "@/assets/hero-lipid.png";
import heroVit from "@/assets/hero-vit.png";
import heroMin from "@/assets/hero-min.png";
import villainDiab from "@/assets/villain-diab.png";
import villainCardio from "@/assets/villain-cardio.png";
import villainCancer from "@/assets/villain-cancer.png";
import villainMental from "@/assets/villain-mental.png";
import villainObes from "@/assets/villain-obes.png";

export const HERO_SPRITES: Record<string, string> = {
  carbo: heroCarbo,
  prot: heroProt,
  lipid: heroLipid,
  vit: heroVit,
  min: heroMin,
};

export const VILLAIN_SPRITES: Record<string, string> = {
  diab: villainDiab,
  cardio: villainCardio,
  cancer: villainCancer,
  mental: villainMental,
  obes: villainObes,
};
