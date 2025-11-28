import { SectionConfig, SectionType } from "./types";

export const SECTIONS: SectionConfig[] = [
  {
    id: SectionType.NRF_NEWS,
    label: "한국연구재단 주요 기사",
    shortLabel: "재단소식",
    searchQuery: "한국연구재단 최근 주요 뉴스 보도자료 성과",
    description: "재단 관련 최신 주요 기사 모음",
    iconName: "Building"
  },
  {
    id: SectionType.SCI_TECH,
    label: "과학기술분야 동향",
    shortLabel: "과기동향",
    searchQuery: "대한민국 과학기술 R&D 정책 기술 개발 최신 동향 뉴스",
    description: "국내외 과학기술 및 R&D 정책 동향",
    iconName: "Atom"
  },
  {
    id: SectionType.HUMANITIES,
    label: "인문사회분야 동향",
    shortLabel: "인문동향",
    searchQuery: "대한민국 인문사회 학술 연구 지원 정책 최신 뉴스 동향",
    description: "인문사회 학술 연구 및 정책 동향",
    iconName: "BookOpen"
  },
  {
    id: SectionType.UNI_SUPPORT,
    label: "대학재정지원사업 동향",
    shortLabel: "대학지원",
    searchQuery: "교육부 대학재정지원사업 RISE 사업 글로컬대학 LINC 3.0 BK21 최신 뉴스",
    description: "대학재정지원사업(RISE, 글로컬 등) 관련 소식",
    iconName: "School"
  }
];