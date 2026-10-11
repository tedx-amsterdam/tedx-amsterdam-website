"use client";

// Single entry point for design system components.
//
// The published bundle (tedx-amsterdam-design-system@1.2.1) has no
// "use client" directive, while some components call React.createContext
// and hooks at module or render time. Importing it from a server component
// crashes the build. Re-exporting through this client module avoids that.
//
// Remove this file and import the package directly once the design system
// marks its interactive components as client components.
export {
  ArrowLink,
  Breadcrumb,
  Button,
  Logo,
  MediaCard,
  NavigationBar,
  SectionHeader,
  SocialLink,
  Tag,
} from "tedx-amsterdam-design-system";
