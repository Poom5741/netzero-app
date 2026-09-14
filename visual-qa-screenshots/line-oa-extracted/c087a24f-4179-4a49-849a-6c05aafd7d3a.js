/* @ds-bundle: {"format":4,"namespace":"NetZeroCarbonDesignSystem_f3e7a8","components":[{"name":"GradientRule","sourcePath":"components/brand/GradientRule.jsx"},{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"SectionHeading","sourcePath":"components/brand/SectionHeading.jsx"},{"name":"StatCounter","sourcePath":"components/brand/StatCounter.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"FilterBar","sourcePath":"components/data/FilterBar.jsx"},{"name":"ProgressBar","sourcePath":"components/data/ProgressBar.jsx"},{"name":"StatTile","sourcePath":"components/data/StatTile.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"ChatBubble","sourcePath":"components/line/ChatBubble.jsx"},{"name":"ChatDivider","sourcePath":"components/line/ChatBubble.jsx"},{"name":"PhotoBubble","sourcePath":"components/line/ChatBubble.jsx"},{"name":"FlexMessage","sourcePath":"components/line/FlexMessage.jsx"},{"name":"PhoneFrame","sourcePath":"components/line/PhoneFrame.jsx"},{"name":"ChatHeader","sourcePath":"components/line/PhoneFrame.jsx"},{"name":"ChatCanvas","sourcePath":"components/line/PhoneFrame.jsx"},{"name":"QuickReplies","sourcePath":"components/line/QuickReplies.jsx"},{"name":"RichMenu","sourcePath":"components/line/RichMenu.jsx"}],"sourceHashes":{"components/brand/GradientRule.jsx":"9a5b7ab25966","components/brand/Logo.jsx":"829a6a4f2ebe","components/brand/SectionHeading.jsx":"948a571d503e","components/brand/StatCounter.jsx":"81be797f19cb","components/core/Badge.jsx":"5c8abd17845b","components/core/Button.jsx":"fe91fee08d89","components/core/Card.jsx":"63355f96d2e7","components/core/Icon.jsx":"216b27c9b2c3","components/core/IconButton.jsx":"f5e7c7658878","components/core/Tag.jsx":"c24ba0ba507a","components/data/DataTable.jsx":"5a818640805d","components/data/FilterBar.jsx":"52561cd4e7e3","components/data/ProgressBar.jsx":"7b8b0f9bffeb","components/data/StatTile.jsx":"d9ad824cbb82","components/forms/Checkbox.jsx":"e2719c2fb8f9","components/forms/Field.jsx":"1c060d0bd8bd","components/forms/Input.jsx":"2a618386cc8d","components/forms/Select.jsx":"3f7d7448c695","components/forms/Textarea.jsx":"fa9f9c2304d9","components/line/ChatBubble.jsx":"ae0646f60b38","components/line/FlexMessage.jsx":"0d0c140d657f","components/line/PhoneFrame.jsx":"1f85e4cb7cbb","components/line/QuickReplies.jsx":"2d56576ee6aa","components/line/RichMenu.jsx":"d6ab796e63b2","ui_kits/admin_console/AdminChrome.jsx":"f1ab444c9d10","ui_kits/admin_console/AdminScreens1.jsx":"f0e5842b22a8","ui_kits/admin_console/AdminScreens2.jsx":"221598f95b68","ui_kits/admin_console/AdminScreens3.jsx":"174909056768","ui_kits/admin_console/calc.jsx":"643452bc66f3","ui_kits/admin_console/data.jsx":"7aa3c4ec9019","ui_kits/line_oa_farmer/LiffScreens.jsx":"07b918ee7ffe","ui_kits/line_oa_farmer/script.jsx":"1b11c2d7d7a1","ui_kits/sponsor_portal/SponsorScreens.jsx":"947908ab012c","ui_kits/website/HomeSections.jsx":"968a8892f3fc","ui_kits/website/Screens.jsx":"88cd31908d93","ui_kits/website/SiteChrome.jsx":"a27b637a078a"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.NetZeroCarbonDesignSystem_f3e7a8 = window.NetZeroCarbonDesignSystem_f3e7a8 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/GradientRule.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function GradientRule({
  width = 72,
  thickness = 3,
  orientation = "horizontal",
  style,
  ...rest
}) {
  const h = orientation === "horizontal";
  return /*#__PURE__*/React.createElement("span", _extends({
    "aria-hidden": "true",
    style: {
      display: "block",
      width: h ? typeof width === "number" ? width + "px" : width : thickness + "px",
      height: h ? thickness + "px" : typeof width === "number" ? width + "px" : width,
      borderRadius: "var(--radius-pill)",
      background: h ? "var(--gradient-rule)" : "linear-gradient(180deg,#52ECCA 0%,#028E91 55%,#061E5C 100%)",
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { GradientRule });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/GradientRule.jsx", error: String((e && e.message) || e) }); }

// components/brand/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const FILES = {
  "horizontal-full": "NZC-Horizontal-Full.png",
  "horizontal-white": "NZC-Horizontal-White.png",
  "horizontal-black": "NZC-Horizontal-Black.png",
  "horizontal-spacegrey": "NZC-Horizontal-SpaceGrey.png",
  "vertical-full": "NZC-Vertical-Full.png",
  "vertical-white": "NZC-Vertical-White.png",
  "vertical-black": "NZC-Vertical-Black.png",
  "vertical-spacegrey": "NZC-Vertical-SpaceGrey.png",
  "mark-full": "NZC-Mark-Full.png"
};
function Logo({
  lockup = "horizontal",
  tone = "full",
  height = 40,
  assetBase = "assets/logos",
  clearspace = false,
  style,
  ...rest
}) {
  const key = lockup === "mark" ? "mark-full" : lockup + "-" + tone;
  const file = FILES[key] || FILES["horizontal-full"];
  const img = /*#__PURE__*/React.createElement("img", _extends({
    src: assetBase + "/" + file,
    alt: "NetZeroCarbon",
    style: {
      height: height + "px",
      width: "auto",
      display: "block",
      ...(clearspace ? null : style)
    }
  }, clearspace ? {} : rest));
  if (!clearspace) return img;
  const pad = Math.round(height * 0.5);
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-block",
      padding: pad + "px",
      ...style
    }
  }, rest), img);
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/brand/SectionHeading.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  tone = "light",
  rule = true,
  as = "h2",
  actions,
  style,
  ...rest
}) {
  const dark = tone === "dark";
  const Tag = as;
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      alignItems: align === "center" ? "center" : "flex-start",
      textAlign: align,
      maxWidth: align === "center" ? "var(--container-narrow)" : "none",
      marginInline: align === "center" ? "auto" : undefined,
      ...style
    }
  }, rest), eyebrow ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--type-eyebrow-size)",
      fontWeight: "var(--weight-semibold)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: dark ? "var(--teal-300)" : "var(--text-accent)"
    }
  }, eyebrow) : null, /*#__PURE__*/React.createElement(Tag, {
    style: {
      fontSize: "var(--type-h2-size)",
      fontWeight: "var(--weight-light)",
      lineHeight: "var(--leading-snug)",
      letterSpacing: "var(--tracking-display)",
      color: dark ? "var(--text-on-dark)" : "var(--text-heading)",
      margin: 0
    }
  }, title), rule ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: "72px",
      height: "3px",
      borderRadius: "var(--radius-pill)",
      background: "var(--gradient-rule)"
    }
  }) : null, lead ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-md)",
      lineHeight: "var(--leading-relaxed)",
      color: dark ? "var(--text-on-dark-muted)" : "var(--text-muted)",
      maxWidth: "62ch"
    }
  }, lead) : null, actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3)",
      marginTop: "var(--space-2)"
    }
  }, actions) : null);
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/brand/StatCounter.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StatCounter({
  value,
  suffix = "",
  prefix = "",
  label,
  description,
  tone = "light",
  animate = true,
  duration = 1800,
  style,
  ...rest
}) {
  const dark = tone === "dark";
  const target = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const [shown, setShown] = React.useState(animate ? 0 : target);
  React.useEffect(() => {
    if (!animate) {
      setShown(target);
      return;
    }
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(target);
      return;
    }
    let raf, start;
    const step = t => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      setShown(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, animate, duration]);
  const decimals = String(target).includes(".") ? String(target).split(".")[1].length : 0;
  const text = shown.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-5xl)",
      fontWeight: "var(--weight-light)",
      lineHeight: "var(--leading-tight)",
      letterSpacing: "var(--tracking-display)",
      color: dark ? "var(--teal-300)" : "var(--text-accent)",
      fontVariantNumeric: "tabular-nums"
    }
  }, prefix, text, suffix), label ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-lg)",
      fontWeight: "var(--weight-semibold)",
      color: dark ? "var(--text-on-dark)" : "var(--text-heading)"
    }
  }, label) : null, description ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-relaxed)",
      color: dark ? "var(--text-on-dark-muted)" : "var(--text-muted)"
    }
  }, description) : null);
}
Object.assign(__ds_scope, { StatCounter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/StatCounter.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  success: {
    bg: "var(--status-success-soft)",
    fg: "var(--teal-800)",
    dot: "var(--status-success)"
  },
  warning: {
    bg: "var(--status-warning-soft)",
    fg: "#8A5B10",
    dot: "var(--status-warning)"
  },
  danger: {
    bg: "var(--status-danger-soft)",
    fg: "#8C2830",
    dot: "var(--status-danger)"
  },
  info: {
    bg: "var(--status-info-soft)",
    fg: "var(--navy-800)",
    dot: "var(--status-info)"
  },
  neutral: {
    bg: "var(--grey-100)",
    fg: "var(--grey-700)",
    dot: "var(--grey-500)"
  }
};
function Badge({
  tone = "success",
  dot = true,
  children,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.success;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      height: "24px",
      padding: "0 var(--space-3)",
      borderRadius: "var(--radius-pill)",
      background: t.bg,
      color: t.fg,
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-semibold)",
      ...style
    }
  }, rest), dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: "6px",
      height: "6px",
      borderRadius: "var(--radius-circle)",
      background: t.dot
    }
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  primary: {
    bg: "var(--action-primary)",
    fg: "var(--text-on-accent)",
    bd: "transparent",
    hoverBg: "var(--action-primary-hover)",
    activeBg: "var(--action-primary-active)"
  },
  secondary: {
    bg: "var(--action-secondary)",
    fg: "var(--text-on-dark)",
    bd: "transparent",
    hoverBg: "var(--action-secondary-hover)",
    activeBg: "var(--navy-950)"
  },
  outline: {
    bg: "transparent",
    fg: "var(--text-heading)",
    bd: "var(--border-default)",
    hoverBg: "var(--navy-50)",
    activeBg: "var(--navy-100)"
  },
  ghost: {
    bg: "transparent",
    fg: "var(--text-accent)",
    bd: "transparent",
    hoverBg: "var(--teal-50)",
    activeBg: "var(--teal-100)"
  },
  onDark: {
    bg: "rgba(255,255,255,.14)",
    fg: "var(--text-on-dark)",
    bd: "var(--border-on-dark)",
    hoverBg: "rgba(255,255,255,.24)",
    activeBg: "rgba(255,255,255,.3)"
  }
};
const SIZES = {
  sm: {
    h: "var(--control-height-sm)",
    px: "var(--space-4)",
    fs: "var(--text-sm)"
  },
  md: {
    h: "var(--control-height-md)",
    px: "var(--space-6)",
    fs: "var(--text-base)"
  },
  lg: {
    h: "var(--control-height-lg)",
    px: "var(--space-8)",
    fs: "var(--text-md)"
  }
};
function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  as = "button",
  href,
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  ...rest
}) {
  const t = TONES[variant] || TONES.primary;
  const s = SIZES[size] || SIZES.md;
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const Tag = href ? "a" : as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    disabled: Tag === "button" ? disabled : undefined,
    onMouseEnter: e => {
      setHover(true);
      onMouseEnter && onMouseEnter(e);
    },
    onMouseLeave: e => {
      setHover(false);
      setPress(false);
      onMouseLeave && onMouseLeave(e);
    },
    onMouseDown: e => {
      setPress(true);
      onMouseDown && onMouseDown(e);
    },
    onMouseUp: e => {
      setPress(false);
      onMouseUp && onMouseUp(e);
    },
    style: {
      display: fullWidth ? "flex" : "inline-flex",
      width: fullWidth ? "100%" : undefined,
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--space-2)",
      height: s.h,
      padding: "0 " + s.px,
      fontFamily: "var(--font-sans)",
      fontSize: s.fs,
      fontWeight: "var(--weight-semibold)",
      lineHeight: 1,
      letterSpacing: "0.01em",
      borderRadius: "var(--radius-control)",
      cursor: disabled ? "not-allowed" : "pointer",
      border: "1px solid " + (disabled ? "transparent" : t.bd),
      background: disabled ? "var(--action-disabled)" : press ? t.activeBg : hover ? t.hoverBg : t.bg,
      color: disabled ? "var(--text-subtle)" : t.fg,
      boxShadow: variant === "primary" && hover && !disabled ? "var(--shadow-accent)" : "none",
      transform: press && !disabled ? "scale(var(--press-scale))" : "none",
      transition: "var(--transition-control), transform var(--duration-instant) var(--ease-standard)",
      textDecoration: "none",
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  media,
  mediaAlt = "",
  eyebrow,
  title,
  children,
  footer,
  tone = "light",
  interactive = false,
  padding,
  style,
  ...rest
}) {
  const dark = tone === "dark";
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("article", _extends({
    onMouseEnter: () => interactive && setHover(true),
    onMouseLeave: () => interactive && setHover(false),
    style: {
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      background: dark ? "var(--surface-inverse)" : "var(--surface-card)",
      border: "1px solid " + (dark ? "var(--border-on-dark)" : "var(--border-subtle)"),
      borderRadius: "var(--radius-card)",
      boxShadow: hover ? "var(--shadow-lg)" : "var(--shadow-sm)",
      transform: hover ? "var(--lift-hover)" : "none",
      transition: "var(--transition-card)",
      cursor: interactive ? "pointer" : "default",
      ...style
    }
  }, rest), media ? typeof media === "string" ? /*#__PURE__*/React.createElement("img", {
    src: media,
    alt: mediaAlt,
    style: {
      width: "100%",
      aspectRatio: "16 / 10",
      objectFit: "cover"
    }
  }) : media : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      padding: padding || "var(--card-padding)",
      flex: 1
    }
  }, eyebrow ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-semibold)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: dark ? "var(--teal-300)" : "var(--text-accent)"
    }
  }, eyebrow) : null, title ? /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: "var(--text-lg)",
      fontWeight: "var(--weight-semibold)",
      lineHeight: "var(--leading-heading)",
      color: dark ? "var(--text-on-dark)" : "var(--text-heading)"
    }
  }, title) : null, children ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-relaxed)",
      color: dark ? "var(--text-on-dark-muted)" : "var(--text-muted)"
    }
  }, children) : null, footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      paddingTop: "var(--space-4)"
    }
  }, footer) : null));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  color = "currentColor",
  style,
  ...rest
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const lucide = typeof window !== "undefined" ? window.lucide : null;
    if (lucide && ref.current) lucide.createIcons({
      nameAttr: "data-lucide",
      icons: lucide.icons,
      attrs: {},
      root: ref.current.parentNode || undefined
    });
  }, [name]);
  return /*#__PURE__*/React.createElement("i", _extends({
    ref: ref,
    "data-lucide": name,
    style: {
      display: "inline-flex",
      width: size + "px",
      height: size + "px",
      color,
      strokeWidth,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const D = {
  sm: 36,
  md: 46,
  lg: 54
};
function IconButton({
  size = "md",
  label,
  children,
  style,
  ...rest
}) {
  const d = D[size] || D.md;
  return /*#__PURE__*/React.createElement(__ds_scope.Button, _extends({
    size: size,
    "aria-label": label,
    style: {
      width: d + "px",
      padding: 0,
      borderRadius: "var(--radius-circle)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  teal: {
    bg: "var(--teal-50)",
    fg: "var(--teal-800)",
    bd: "var(--teal-200)"
  },
  navy: {
    bg: "var(--navy-50)",
    fg: "var(--navy-800)",
    bd: "var(--navy-200)"
  },
  neutral: {
    bg: "var(--grey-100)",
    fg: "var(--grey-700)",
    bd: "var(--grey-200)"
  },
  solid: {
    bg: "var(--teal-600)",
    fg: "var(--white)",
    bd: "transparent"
  },
  onDark: {
    bg: "rgba(255,255,255,.12)",
    fg: "var(--white)",
    bd: "var(--border-on-dark)"
  }
};
function Tag({
  tone = "teal",
  icon,
  children,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.teal;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      height: "28px",
      padding: "0 var(--space-3)",
      borderRadius: "var(--radius-pill)",
      background: t.bg,
      color: t.fg,
      border: "1px solid " + t.bd,
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-semibold)",
      letterSpacing: "0.02em",
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), icon, children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function DataTable({
  columns = [],
  rows = [],
  onRowClick,
  dense = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-card)",
      overflow: "hidden",
      background: "var(--surface-card)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "var(--text-sm)"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      textAlign: c.align || "left",
      background: "var(--grey-50)",
      padding: dense ? "8px 12px" : "11px 14px",
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-muted)",
      borderBottom: "1px solid var(--border-subtle)",
      whiteSpace: "nowrap"
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: r.id || i,
    onClick: () => onRowClick && onRowClick(r),
    style: {
      cursor: onRowClick ? "pointer" : "default",
      background: "var(--white)"
    },
    onMouseEnter: e => {
      if (onRowClick) e.currentTarget.style.background = "var(--navy-50)";
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = "var(--white)";
    }
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: {
      textAlign: c.align || "left",
      padding: dense ? "8px 12px" : "11px 14px",
      borderBottom: i === rows.length - 1 ? "none" : "1px solid var(--grey-100)",
      color: "var(--text-body)",
      fontVariantNumeric: c.align === "right" ? "tabular-nums" : "normal"
    }
  }, c.render ? c.render(r) : r[c.key])))))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/FilterBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function FilterBar({
  label = "ตัวกรอง",
  filters = [],
  onChange,
  actions,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      flexWrap: "wrap",
      ...style
    }
  }, rest), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-subtle)"
    }
  }, label) : null, filters.map(f => /*#__PURE__*/React.createElement("label", {
    key: f.id,
    style: {
      display: "inline-flex",
      flexDirection: "column",
      gap: "1px",
      minWidth: "148px",
      padding: "6px 14px",
      borderRadius: "var(--radius-md)",
      border: "1px solid " + (f.active ? "var(--border-accent)" : "var(--border-subtle)"),
      background: f.active ? "var(--surface-accent-soft)" : "var(--white)",
      boxShadow: f.active ? "none" : "var(--shadow-xs)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "10.5px",
      color: "var(--text-subtle)"
    }
  }, f.label), /*#__PURE__*/React.createElement("select", {
    value: f.value,
    onChange: e => onChange && onChange(f.id, e.target.value),
    style: {
      border: "none",
      background: "none",
      outline: "none",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: f.active ? "var(--teal-800)" : "var(--text-heading)",
      cursor: "pointer",
      padding: 0,
      appearance: "none"
    }
  }, f.options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o))))), actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-2)",
      marginLeft: "auto"
    }
  }, actions) : null);
}
Object.assign(__ds_scope, { FilterBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/FilterBar.jsx", error: String((e && e.message) || e) }); }

// components/data/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ProgressBar({
  value = 0,
  max = 100,
  label,
  valueLabel,
  tone = "teal",
  height = 9,
  style,
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const fill = {
    teal: "var(--teal-600)",
    mint: "var(--teal-400)",
    navy: "var(--navy-700)",
    grey: "var(--grey-300)",
    warn: "var(--status-warning)"
  }[tone] || "var(--teal-600)";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      ...style
    }
  }, rest), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "0 0 132px",
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, label) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: height + "px",
      background: "var(--grey-100)",
      borderRadius: "var(--radius-pill)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      width: pct + "%",
      height: "100%",
      background: fill,
      borderRadius: "var(--radius-pill)",
      transition: "width var(--duration-slow) var(--ease-out)"
    }
  })), valueLabel ? /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "0 0 76px",
      textAlign: "right",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)",
      fontVariantNumeric: "tabular-nums"
    }
  }, valueLabel) : null);
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/data/StatTile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StatTile({
  value,
  unit,
  label,
  note,
  delta,
  tone = "light",
  align = "left",
  style,
  ...rest
}) {
  const dark = tone === "dark";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: dark ? "var(--surface-inverse)" : "var(--surface-card)",
      border: "1px solid " + (dark ? "var(--border-on-dark)" : "var(--border-subtle)"),
      borderRadius: "var(--radius-card)",
      padding: "var(--space-5) var(--space-6)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      textAlign: align,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: dark ? "var(--teal-300)" : "var(--text-heading)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "var(--space-2)",
      justifyContent: align === "center" ? "center" : "flex-start"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-4xl)",
      fontWeight: "var(--weight-light)",
      lineHeight: 1,
      letterSpacing: "var(--tracking-display)",
      color: dark ? "var(--white)" : "var(--text-heading)",
      fontVariantNumeric: "tabular-nums"
    }
  }, value), unit ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: dark ? "rgba(255,255,255,.7)" : "var(--text-muted)"
    }
  }, unit) : null, delta ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-semibold)",
      color: String(delta).trim().startsWith("-") ? "var(--status-danger)" : "var(--status-success)"
    }
  }, delta) : null), note ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xs)",
      lineHeight: "var(--leading-relaxed)",
      color: dark ? "rgba(255,255,255,.66)" : "var(--text-subtle)"
    }
  }, note) : null);
}
Object.assign(__ds_scope, { StatTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatTile.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  checked,
  defaultChecked,
  disabled = false,
  onChange,
  style,
  ...rest
}) {
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : internal;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-3)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? .55 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: on,
    disabled: disabled,
    onChange: e => {
      if (!isControlled) setInternal(e.target.checked);
      onChange && onChange(e);
    },
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: "20px",
      height: "20px",
      flex: "0 0 20px",
      display: "grid",
      placeItems: "center",
      borderRadius: "var(--radius-xs)",
      border: "1px solid " + (on ? "var(--teal-600)" : "var(--border-default)"),
      background: on ? "var(--teal-600)" : "var(--white)",
      color: "var(--white)",
      fontSize: "13px",
      lineHeight: 1,
      transition: "var(--transition-control)"
    }
  }, on ? "✓" : ""), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-body)"
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Field({
  label,
  hint,
  error,
  required = false,
  htmlFor,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      ...style
    }
  }, rest), label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)"
    }
  }, label, required ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--status-danger)",
      marginLeft: "4px"
    }
  }, "*") : null) : null, children, error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--status-danger)"
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-subtle)"
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  invalid = false,
  style,
  onFocus,
  onBlur,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("input", _extends({
    onFocus: e => {
      setFocus(true);
      onFocus && onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      onBlur && onBlur(e);
    },
    style: {
      width: "100%",
      height: "var(--field-height)",
      padding: "0 var(--space-4)",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-base)",
      color: "var(--text-body)",
      background: "var(--white)",
      border: "1px solid " + (invalid ? "var(--status-danger)" : focus ? "var(--border-accent)" : "var(--border-default)"),
      borderRadius: "var(--radius-field)",
      boxShadow: focus ? "var(--ring-focus)" : "none",
      outline: "none",
      transition: "var(--transition-control)",
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  invalid = false,
  children,
  style,
  onFocus,
  onBlur,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    onFocus: e => {
      setFocus(true);
      onFocus && onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      onBlur && onBlur(e);
    },
    style: {
      width: "100%",
      height: "var(--field-height)",
      padding: "0 var(--space-10) 0 var(--space-4)",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-base)",
      color: "var(--text-body)",
      background: "var(--white)",
      border: "1px solid " + (invalid ? "var(--status-danger)" : focus ? "var(--border-accent)" : "var(--border-default)"),
      borderRadius: "var(--radius-field)",
      boxShadow: focus ? "var(--ring-focus)" : "none",
      outline: "none",
      appearance: "none",
      cursor: "pointer",
      transition: "var(--transition-control)",
      ...style
    }
  }, rest), children), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      right: "var(--space-4)",
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      color: "var(--text-subtle)",
      fontSize: "12px"
    }
  }, "\u25BE"));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Textarea({
  invalid = false,
  rows = 5,
  style,
  onFocus,
  onBlur,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("textarea", _extends({
    rows: rows,
    onFocus: e => {
      setFocus(true);
      onFocus && onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      onBlur && onBlur(e);
    },
    style: {
      width: "100%",
      padding: "var(--space-3) var(--space-4)",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-base)",
      lineHeight: "var(--leading-normal)",
      color: "var(--text-body)",
      background: "var(--white)",
      border: "1px solid " + (invalid ? "var(--status-danger)" : focus ? "var(--border-accent)" : "var(--border-default)"),
      borderRadius: "var(--radius-field)",
      boxShadow: focus ? "var(--ring-focus)" : "none",
      outline: "none",
      resize: "vertical",
      transition: "var(--transition-control)",
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/line/ChatBubble.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ChatBubble({
  from = "oa",
  time,
  read = false,
  avatar = true,
  children,
  style,
  ...rest
}) {
  const me = from === "me";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: me ? "flex-end" : "flex-start",
      gap: "7px",
      alignItems: "flex-end"
    }
  }, !me && avatar ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: "30px",
      height: "30px",
      borderRadius: "var(--radius-circle)",
      background: "#fff",
      flex: "none",
      display: "grid",
      placeItems: "center",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logos/NZC-Mark-Full.png",
    alt: "",
    style: {
      width: "26px",
      height: "26px",
      objectFit: "contain"
    }
  })) : null, me && time ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "9.5px",
      color: "rgba(255,255,255,.9)",
      marginBottom: "2px",
      flex: "none",
      textAlign: "right"
    }
  }, read ? "อ่านแล้ว" : null, /*#__PURE__*/React.createElement("br", null), time) : null, /*#__PURE__*/React.createElement("div", _extends({
    style: {
      maxWidth: "232px",
      background: me ? "var(--line-bubble-me)" : "var(--line-bubble-you)",
      color: "var(--line-chat-ink)",
      borderRadius: me ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
      padding: "9px 12px",
      fontSize: "13px",
      lineHeight: 1.55,
      whiteSpace: "pre-line",
      boxShadow: "0 1px 1px rgba(0,0,0,.06)",
      ...style
    }
  }, rest), children), !me && time ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "9.5px",
      color: "rgba(255,255,255,.9)",
      marginBottom: "2px",
      flex: "none"
    }
  }, time) : null);
}
function ChatDivider({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: "rgba(0,0,0,.22)",
      color: "#fff",
      fontSize: "11px",
      padding: "3px 12px",
      borderRadius: "var(--radius-pill)"
    }
  }, children));
}
function PhotoBubble({
  caption,
  gps,
  time,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "7px",
      alignItems: "flex-end"
    }
  }, time ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "9.5px",
      color: "rgba(255,255,255,.9)",
      marginBottom: "2px"
    }
  }, time) : null, /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: "relative",
      width: "150px",
      height: "112px",
      borderRadius: "14px",
      overflow: "hidden",
      background: "linear-gradient(180deg,#9FC7E8 0%,#CFE3B9 55%,#8FA95C 100%)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "52%",
      top: "20%",
      width: "14px",
      height: "58px",
      background: "#E7EDF2",
      borderRadius: "3px",
      boxShadow: "0 0 0 1px rgba(0,0,0,.15)"
    }
  }), gps ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "6px",
      bottom: "6px",
      background: "rgba(0,0,0,.55)",
      color: "#fff",
      fontSize: "9px",
      padding: "2px 6px",
      borderRadius: "5px"
    }
  }, gps) : null, caption ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: "6px",
      top: "6px",
      background: "rgba(0,0,0,.55)",
      color: "#fff",
      fontSize: "9px",
      padding: "2px 6px",
      borderRadius: "5px"
    }
  }, caption) : null));
}
Object.assign(__ds_scope, { ChatBubble, ChatDivider, PhotoBubble });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/line/ChatBubble.jsx", error: String((e && e.message) || e) }); }

// components/line/FlexMessage.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const HERO = {
  teal: "linear-gradient(120deg,#027276,#02A99E)",
  navy: "linear-gradient(120deg,#061E5C,#1C489F)",
  green: "linear-gradient(120deg,#04A344,#06C755)",
  amber: "linear-gradient(120deg,#8A5A10,#D9A21B)",
  grey: "linear-gradient(120deg,#3B4753,#6B7B8C)"
};
function FlexMessage({
  hero,
  heroTone = "teal",
  heroBadge,
  title,
  subtitle,
  rows,
  children,
  actions,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: "248px",
      background: "#fff",
      borderRadius: "14px",
      overflow: "hidden",
      boxShadow: "0 1px 2px rgba(0,0,0,.1)",
      ...style
    }
  }, rest), hero ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      background: HERO[heroTone] || HERO.teal,
      color: "#fff",
      minHeight: "56px",
      display: "flex",
      alignItems: "flex-end",
      padding: "9px 12px",
      fontSize: "11.5px",
      fontWeight: "var(--weight-bold)"
    }
  }, heroBadge ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "8px",
      left: "10px",
      background: "rgba(0,0,0,.34)",
      padding: "2px 8px",
      borderRadius: "var(--radius-pill)",
      fontSize: "10px",
      fontWeight: "var(--weight-semibold)"
    }
  }, heroBadge) : null, hero) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "11px 12px"
    }
  }, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: "var(--weight-bold)",
      fontSize: "13.5px",
      color: "var(--line-chat-ink)",
      marginBottom: "3px"
    }
  }, title) : null, subtitle ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--line-chat-ink-3)",
      fontSize: "11px",
      marginBottom: "8px"
    }
  }, subtitle) : null, (rows || []).map(([k, v, tone]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: "8px",
      padding: "3px 0",
      borderBottom: "1px dashed #EAEFF4",
      fontSize: "11.5px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--line-chat-ink-3)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--weight-semibold)",
      color: tone === "good" ? "var(--status-success)" : tone === "warn" ? "var(--status-warning)" : "var(--line-chat-ink)",
      textAlign: "right"
    }
  }, v))), children ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11.5px",
      lineHeight: 1.6,
      color: "var(--line-chat-ink-2)",
      marginTop: rows ? "8px" : 0
    }
  }, children) : null), actions && actions.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--line-hairline)",
      display: "flex"
    }
  }, actions.map((a, i) => /*#__PURE__*/React.createElement("button", {
    key: a.label,
    onClick: a.onClick,
    style: {
      flex: 1,
      border: "none",
      borderLeft: i ? "1px solid var(--line-hairline)" : "none",
      padding: "9px 4px",
      fontFamily: "var(--font-sans)",
      fontSize: "12px",
      fontWeight: "var(--weight-bold)",
      cursor: "pointer",
      background: a.primary ? "var(--line-green)" : "#fff",
      color: a.primary ? "#fff" : "var(--line-green-dark)"
    }
  }, a.label))) : null);
}
Object.assign(__ds_scope, { FlexMessage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/line/FlexMessage.jsx", error: String((e && e.message) || e) }); }

// components/line/PhoneFrame.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function PhoneFrame({
  time = "09:41",
  battery = "84%",
  children,
  width = 360,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: width + "px",
      background: "#0F1720",
      borderRadius: "var(--phone-radius)",
      padding: "10px 10px 12px",
      boxShadow: "var(--shadow-xl)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "5px 14px 6px",
      color: "#fff",
      fontSize: "11.5px",
      fontWeight: "var(--weight-semibold)",
      opacity: .95
    }
  }, /*#__PURE__*/React.createElement("span", null, time), /*#__PURE__*/React.createElement("span", null, "\u25AE\u25AE\u25AE ", battery)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--line-chat-bg)",
      borderRadius: "26px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    }
  }, children));
}
function ChatHeader({
  title = "NetZeroCarbon",
  subtitle,
  onMenu,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: "var(--line-green)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 12px",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "19px",
      opacity: .9
    }
  }, "\u2039"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: "30px",
      height: "30px",
      borderRadius: "var(--radius-circle)",
      background: "#fff",
      display: "grid",
      placeItems: "center",
      flex: "none",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logos/NZC-Mark-Full.png",
    alt: "",
    style: {
      width: "26px",
      height: "26px",
      objectFit: "contain"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontWeight: "var(--weight-bold)",
      fontSize: "14px",
      lineHeight: 1.2
    }
  }, title), subtitle ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "10.5px",
      opacity: .85
    }
  }, subtitle) : null), /*#__PURE__*/React.createElement("button", {
    onClick: onMenu,
    style: {
      marginLeft: "auto",
      background: "none",
      border: "none",
      color: "#fff",
      fontSize: "16px",
      cursor: "pointer",
      opacity: .9
    }
  }, "\u2630"));
}
function ChatCanvas({
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      padding: "14px 12px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "11px",
      overflowY: "auto",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { PhoneFrame, ChatHeader, ChatCanvas });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/line/PhoneFrame.jsx", error: String((e && e.message) || e) }); }

// components/line/QuickReplies.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function QuickReplies({
  items = [],
  onPick,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      gap: "6px",
      flexWrap: "wrap",
      ...style
    }
  }, rest), items.map(it => {
    const label = typeof it === "string" ? it : it.label;
    return /*#__PURE__*/React.createElement("button", {
      key: label,
      onClick: () => onPick && onPick(typeof it === "string" ? {
        label
      } : it),
      style: {
        background: "#fff",
        border: "1px solid var(--line-qr-border)",
        borderRadius: "var(--radius-pill)",
        padding: "6px 13px",
        fontFamily: "var(--font-sans)",
        fontSize: "12px",
        fontWeight: "var(--weight-semibold)",
        color: "var(--line-green-dark)",
        cursor: "pointer",
        whiteSpace: "nowrap"
      }
    }, label);
  }));
}
Object.assign(__ds_scope, { QuickReplies });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/line/QuickReplies.jsx", error: String((e && e.message) || e) }); }

// components/line/RichMenu.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function RichMenu({
  items = [],
  single,
  onPick,
  showBar = true,
  style,
  ...rest
}) {
  const cells = single ? [single] : items;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: "#fff",
      borderTop: "1px solid var(--line-hairline)",
      ...style
    }
  }, rest), showBar ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 12px",
      borderBottom: "1px solid var(--line-hairline)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "15px",
      color: "#94A2B2"
    }
  }, "\u2630"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      background: "#F1F4F8",
      borderRadius: "var(--radius-pill)",
      padding: "6px 12px",
      color: "#94A2B2",
      fontSize: "12px"
    }
  }, "\u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "15px",
      color: "#94A2B2"
    }
  }, "\u263A")) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: single ? "1fr" : "repeat(3,1fr)",
      gap: "1px",
      background: "var(--line-hairline)"
    }
  }, cells.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.label,
    onClick: () => onPick && onPick(c),
    style: {
      background: c.active ? "var(--teal-50)" : "#fff",
      border: "none",
      padding: single ? "16px 10px" : "13px 6px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "5px",
      cursor: "pointer",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: single ? "20px" : "18px",
      lineHeight: 1
    }
  }, c.glyph), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "11px",
      fontWeight: "var(--weight-semibold)",
      color: c.active ? "var(--teal-800)" : "var(--line-chat-ink-2)",
      textAlign: "center",
      lineHeight: 1.3
    }
  }, c.label)))));
}
Object.assign(__ds_scope, { RichMenu });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/line/RichMenu.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin_console/AdminChrome.jsx
try { (() => {
const {
  Logo,
  Button,
  Badge,
  Tag,
  Icon,
  Field,
  Input,
  Checkbox,
  GradientRule,
  StatTile
} = window.NetZeroCarbonDesignSystem_f3e7a8;

// ----- F-34 · เข้าสู่ระบบด้วยบัญชีที่เข้าถึงได้ทุกอย่าง -----
function LoginScreen({
  onLogin,
  role = "admin"
}) {
  const admin = role === "admin";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "1.05fr .95fr"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      background: "var(--gradient-deep)",
      padding: "var(--space-16) var(--space-12)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/imagery/renewables-wind-farm.png",
    alt: "",
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      opacity: .18
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    assetBase: "../../assets/logos",
    tone: "white",
    height: 36
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: "var(--teal-300)"
    }
  }, admin ? "Admin Console" : "Sponsor Portal"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: "var(--text-4xl)",
      fontWeight: "var(--weight-light)",
      lineHeight: "var(--leading-snug)",
      letterSpacing: "var(--tracking-display)",
      color: "#fff",
      maxWidth: "22ch"
    }
  }, admin ? "โครงการทำนาลดโลกร้อน — ระบบหลังบ้าน" : "พื้นที่และเครดิตที่บริษัทของท่านสนับสนุน"), /*#__PURE__*/React.createElement(GradientRule, {
    width: 120
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-md)",
      lineHeight: "var(--leading-relaxed)",
      color: "rgba(255,255,255,.82)",
      maxWidth: "44ch"
    }
  }, admin ? "ตรวจภาพหลักฐาน อนุมัติใบสมัคร คำนวณเครดิต และส่งออกรายงานสำหรับขึ้นทะเบียน Premium T-VER" : "ดูได้เฉพาะพื้นที่และเกษตรกรที่บริษัทของท่านสนับสนุน ตามสิทธิ์ที่แอดมินตั้งค่าไว้")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      fontSize: "var(--text-xs)",
      color: "rgba(255,255,255,.55)"
    }
  }, "\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E1A\u0E27\u0E34\u0E18\u0E35 T-VER-P-METH-13-08 \xB7 \u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17 \u0E40\u0E19\u0E17\u0E0B\u0E35\u0E42\u0E23\u0E04\u0E32\u0E23\u0E4C\u0E1A\u0E2D\u0E19 \u0E08\u0E33\u0E01\u0E31\u0E14")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      placeItems: "center",
      padding: "var(--space-12)",
      background: "var(--surface-page)"
    }
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onLogin();
    },
    style: {
      width: "100%",
      maxWidth: "392px",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "0 0 var(--space-2)",
      fontSize: "var(--text-2xl)",
      fontWeight: "var(--weight-light)"
    }
  }, "\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      color: "var(--text-muted)"
    }
  }, admin ? "บัญชีเจ้าหน้าที่ NZC · เข้าถึงได้ทุกพื้นที่และทุกเมนู" : "บัญชีบริษัทผู้สนับสนุน · ขอบเขตกำหนดโดยแอดมิน")), /*#__PURE__*/React.createElement(Field, {
    label: "\u0E2D\u0E35\u0E40\u0E21\u0E25\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17",
    required: true,
    htmlFor: "lg-e"
  }, /*#__PURE__*/React.createElement(Input, {
    id: "lg-e",
    type: "email",
    defaultValue: admin ? "admin@netzero-carbon.io" : "esg@scbx.co.th"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19",
    required: true,
    htmlFor: "lg-p"
  }, /*#__PURE__*/React.createElement(Input, {
    id: "lg-p",
    type: "password",
    defaultValue: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\u0E23\u0E2B\u0E31\u0E2A OTP \u0E08\u0E32\u0E01\u0E41\u0E2D\u0E1B",
    hint: "\u0E1A\u0E31\u0E07\u0E04\u0E31\u0E1A\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E17\u0E35\u0E48\u0E40\u0E2B\u0E47\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E48\u0E27\u0E19\u0E1A\u0E38\u0E04\u0E04\u0E25",
    htmlFor: "lg-o"
  }, /*#__PURE__*/React.createElement(Input, {
    id: "lg-o",
    placeholder: "000000"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "\u0E08\u0E33\u0E2D\u0E38\u0E1B\u0E01\u0E23\u0E13\u0E4C\u0E19\u0E35\u0E49\u0E44\u0E27\u0E49 30 \u0E27\u0E31\u0E19"
  }), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      fontSize: "var(--text-sm)"
    }
  }, "\u0E25\u0E37\u0E21\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19")), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    size: "lg",
    fullWidth: true,
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 16
    })
  }, "\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-2)",
      padding: "var(--space-4)",
      background: "var(--surface-sunken)",
      borderRadius: "var(--radius-md)",
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)",
      lineHeight: "var(--leading-relaxed)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, "\u0E17\u0E38\u0E01\u0E01\u0E32\u0E23\u0E40\u0E02\u0E49\u0E32\u0E14\u0E39\u0E41\u0E25\u0E30\u0E41\u0E01\u0E49\u0E44\u0E02\u0E16\u0E39\u0E01\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E43\u0E19 audit log (AD-11) \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49 \u0E40\u0E27\u0E25\u0E32 \u0E41\u0E25\u0E30\u0E04\u0E48\u0E32\u0E01\u0E48\u0E2D\u0E19-\u0E2B\u0E25\u0E31\u0E07")))));
}

// ----- โครงหน้าหลังบ้าน: sidebar + topbar -----
function ConsoleShell({
  nav,
  screen,
  onNavigate,
  account,
  role,
  children,
  onLogout
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "232px minmax(0,1fr)",
      minHeight: "100vh",
      background: "var(--surface-sunken)"
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      background: "var(--surface-inverse)",
      display: "flex",
      flexDirection: "column",
      padding: "var(--space-6) var(--space-4)",
      gap: "var(--space-6)",
      position: "sticky",
      top: 0,
      height: "100vh"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    assetBase: "../../assets/logos",
    tone: "white",
    height: 28
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "2px"
    }
  }, nav.map(n => n.divider ? /*#__PURE__*/React.createElement("div", {
    key: n.label,
    style: {
      fontSize: "10px",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: "rgba(255,255,255,.42)",
      fontWeight: "var(--weight-semibold)",
      padding: "var(--space-4) var(--space-3) var(--space-2)"
    }
  }, n.label) : /*#__PURE__*/React.createElement("button", {
    key: n.id,
    onClick: () => onNavigate(n.id),
    style: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      textAlign: "left",
      border: "none",
      borderRadius: "var(--radius-sm)",
      padding: "9px 11px",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: "13px",
      fontWeight: "var(--weight-semibold)",
      background: screen === n.id ? "rgba(255,255,255,.12)" : "transparent",
      color: screen === n.id ? "#fff" : "rgba(255,255,255,.72)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: n.icon,
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, n.label), n.count ? /*#__PURE__*/React.createElement("span", {
    style: {
      background: "var(--teal-500)",
      color: "#fff",
      fontSize: "10.5px",
      fontWeight: "var(--weight-bold)",
      borderRadius: "var(--radius-pill)",
      padding: "1px 7px"
    }
  }, n.count) : null))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      borderTop: "1px solid var(--border-on-dark)",
      paddingTop: "var(--space-4)",
      display: "flex",
      alignItems: "center",
      gap: "10px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "32px",
      height: "32px",
      borderRadius: "var(--radius-circle)",
      background: "var(--teal-600)",
      color: "#fff",
      display: "grid",
      placeItems: "center",
      fontSize: "12px",
      fontWeight: "var(--weight-bold)",
      flex: "none"
    }
  }, account.initials), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "12px",
      fontWeight: "var(--weight-semibold)",
      color: "#fff",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, account.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "10.5px",
      color: "rgba(255,255,255,.6)"
    }
  }, role)), /*#__PURE__*/React.createElement("button", {
    onClick: onLogout,
    title: "\u0E2D\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A",
    style: {
      background: "none",
      border: "none",
      color: "rgba(255,255,255,.6)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "log-out",
    size: 15
  })))), /*#__PURE__*/React.createElement("main", {
    style: {
      minWidth: 0,
      padding: "var(--space-8) var(--space-10) var(--space-16)"
    }
  }, children));
}
function PageTitle({
  eyebrow,
  title,
  sub,
  actions
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: "var(--space-8)",
      marginBottom: "var(--space-6)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", null, eyebrow ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-semibold)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: "var(--text-accent)"
    }
  }, eyebrow) : null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "var(--space-2) 0 0",
      fontSize: "var(--text-3xl)",
      fontWeight: "var(--weight-light)",
      letterSpacing: "var(--tracking-display)"
    }
  }, title), sub ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-2) 0 0",
      fontSize: "var(--text-sm)",
      color: "var(--text-muted)"
    }
  }, sub) : null), actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-2)"
    }
  }, actions) : null);
}
function Section({
  title,
  sub,
  actions,
  children,
  pad = true
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-card)",
      boxShadow: "var(--shadow-xs)",
      overflow: "hidden"
    }
  }, title ? /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-6)",
      padding: "var(--space-5) var(--space-6)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: "var(--text-md)",
      fontWeight: "var(--weight-semibold)"
    }
  }, title), sub ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "3px 0 0",
      fontSize: "var(--text-xs)",
      color: "var(--text-subtle)"
    }
  }, sub) : null), actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-2)"
    }
  }, actions) : null) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: pad ? "var(--space-6)" : 0
    }
  }, children));
}
function PdpaNote({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3)",
      alignItems: "flex-start",
      padding: "var(--space-4) var(--space-5)",
      background: "var(--status-info-soft)",
      border: "1px solid var(--navy-100)",
      borderRadius: "var(--radius-md)",
      fontSize: "var(--text-xs)",
      lineHeight: "var(--leading-relaxed)",
      color: "var(--navy-800)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "none",
      marginTop: "1px"
    }
  }, "\uD83D\uDD12"), /*#__PURE__*/React.createElement("span", null, children));
}

// เส้นกราฟแท่งเทียบเครดิต — ใช้ทั้งฝั่งแอดมินและฝั่งลูกค้า
function CreditChart({
  seasons,
  showBaseline = true,
  height = 190
}) {
  const max = Math.max(...seasons.map(s => Math.max(s.baseline, s.estimate, s.verified))) || 1;
  const bar = (v, fill, label) => /*#__PURE__*/React.createElement("span", {
    title: label,
    style: {
      flex: 1,
      height: Math.max(2, v / max * height) + "px",
      background: fill,
      borderRadius: "4px 4px 0 0",
      minWidth: "8px"
    }
  });
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: "var(--space-6)",
      height: height + "px",
      borderBottom: "1px solid var(--border-default)",
      paddingBottom: "1px"
    }
  }, seasons.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.label,
    style: {
      flex: 1,
      display: "flex",
      alignItems: "flex-end",
      gap: "3px",
      height: "100%"
    }
  }, showBaseline ? bar(s.baseline, "var(--grey-200)", "กรณีฐาน (BE)") : null, bar(s.estimate, "var(--teal-300)", "ประมาณการ (ER)"), bar(s.verified, "var(--teal-700)", "ทวนสอบแล้ว")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-6)",
      marginTop: "var(--space-2)"
    }
  }, seasons.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.label,
    style: {
      flex: 1,
      fontSize: "10.5px",
      color: "var(--text-subtle)",
      textAlign: "center",
      lineHeight: 1.35
    }
  }, s.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-5)",
      marginTop: "var(--space-4)",
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)",
      flexWrap: "wrap"
    }
  }, (showBaseline ? [["var(--grey-200)", "กรณีฐาน BE (tCO₂eq)"]] : []).concat([["var(--teal-300)", "ประมาณการ ER"], ["var(--teal-700)", "ทวนสอบแล้ว"]]).map(([c, l]) => /*#__PURE__*/React.createElement("span", {
    key: l,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "10px",
      height: "10px",
      borderRadius: "3px",
      background: c
    }
  }), l))));
}
Object.assign(window, {
  LoginScreen,
  ConsoleShell,
  PageTitle,
  Section,
  PdpaNote,
  CreditChart
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin_console/AdminChrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin_console/AdminScreens1.jsx
try { (() => {
const {
  Button,
  Badge,
  Tag,
  Icon,
  StatTile,
  FilterBar,
  DataTable,
  ProgressBar,
  Field,
  Textarea,
  Checkbox
} = window.NetZeroCarbonDesignSystem_f3e7a8;
const fmt = (n, d = 2) => Number(n).toLocaleString(undefined, {
  minimumFractionDigits: d,
  maximumFractionDigits: d
});

// ===== AD-08 / AD-17 · ภาพรวมโครงการ =====
function OverviewScreen({
  filters,
  onFilter,
  onNavigate
}) {
  const totalRai = PROVINCES.reduce((s, p) => s + p.rai, 0);
  const needPhotos = FARMERS.reduce((s, f) => s + f.need, 0);
  const gotPhotos = FARMERS.reduce((s, f) => s + f.photos, 0);
  const fallbacks = FARMERS.reduce((s, f) => s + f.fallback, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(PageTitle, {
    eyebrow: "\u0E20\u0E32\u0E1E\u0E23\u0E27\u0E21\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23",
    title: "\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23\u0E17\u0E33\u0E19\u0E32\u0E25\u0E14\u0E42\u0E25\u0E01\u0E23\u0E49\u0E2D\u0E19 \u2014 \u0E17\u0E38\u0E01\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48",
    sub: "\u0E15.\u0E2B\u0E19\u0E2D\u0E07\u0E2A\u0E30\u0E40\u0E14\u0E32 \u0E2D.\u0E2A\u0E32\u0E21\u0E0A\u0E38\u0E01 \u0E08.\u0E2A\u0E38\u0E1E\u0E23\u0E23\u0E13\u0E1A\u0E38\u0E23\u0E35 \u0E41\u0E25\u0E30 \u0E08.\u0E0A\u0E31\u0E22\u0E19\u0E32\u0E17 \xB7 \u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E1A\u0E27\u0E34\u0E18\u0E35 T-VER-P-METH-13-08 \u0E09\u0E1A\u0E31\u0E1A\u0E17\u0E35\u0E48 01 \xB7 \u0E41\u0E19\u0E27\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E17\u0E35\u0E48 3 (\u0E04\u0E48\u0E32\u0E41\u0E19\u0E30\u0E19\u0E33)",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "download",
        size: 15
      }),
      onClick: () => onNavigate("reports")
    }, "\u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      onClick: () => onNavigate("review")
    }, "\u0E04\u0E34\u0E27\u0E15\u0E23\u0E27\u0E08\u0E20\u0E32\u0E1E"))
  }), /*#__PURE__*/React.createElement(FilterBar, {
    filters: filters,
    onChange: onFilter
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement(StatTile, {
    label: "\u0E04\u0E23\u0E31\u0E27\u0E40\u0E23\u0E37\u0E2D\u0E19\u0E17\u0E35\u0E48\u0E40\u0E02\u0E49\u0E32\u0E23\u0E48\u0E27\u0E21",
    value: FARMERS.length + PROVINCES[1].households,
    unit: "\u0E04\u0E23\u0E31\u0E27\u0E40\u0E23\u0E37\u0E2D\u0E19",
    delta: "+" + PROVINCES[1].households,
    note: "CPA code " + FARMERS.length + " ราย ในพื้นที่ที่ขึ้นทะเบียนแล้ว · " + PROVINCES[1].households + " รายในกลุ่มใหม่"
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "\u0E41\u0E1B\u0E25\u0E07\u0E22\u0E48\u0E2D\u0E22\u0E17\u0E35\u0E48\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23",
    value: PLOTS.length + 24,
    unit: "\u0E41\u0E1B\u0E25\u0E07",
    note: "ตามเอกสารสิทธิ์ " + new Set(PLOTS.map(p => p.deed.split(",")[0])).size + " เลขโฉนด · มี WKT ขอบแปลงครบทุกแปลง"
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E23\u0E27\u0E21",
    value: fmt(totalRai, 1),
    unit: "\u0E44\u0E23\u0E48",
    note: fmt(totalRai * 0.16, 1) + " เฮกตาร์ · เฉลี่ย " + fmt(totalRai / (PLOTS.length + 24), 1) + " ไร่/แปลง · รอบปลูก 120 วัน"
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E2A\u0E38\u0E17\u0E18\u0E34\u0E1B\u0E35 2569 (ER)",
    value: fmt(GHG_2569.er),
    unit: "tCO\u2082eq",
    note: "BE " + fmt(GHG_2569.be) + " − PE " + fmt(GHG_2569.pe) + " แล้วหัก U_d 15% · 2 ฤดู (นาปี + นาปรัง)"
  })), /*#__PURE__*/React.createElement(Section, {
    title: "\u0E04\u0E34\u0E27\u0E07\u0E32\u0E19\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23",
    sub: "\u0E2B\u0E19\u0E49\u0E32\u0E2B\u0E25\u0E31\u0E07\u0E1A\u0E49\u0E32\u0E19\u0E17\u0E35\u0E48\u0E14\u0E35\u0E15\u0E49\u0E2D\u0E07\u0E1A\u0E2D\u0E01\u0E27\u0E48\u0E32 \"\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49\u0E15\u0E49\u0E2D\u0E07\u0E17\u0E33\u0E2D\u0E30\u0E44\u0E23\" \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E41\u0E04\u0E48\u0E22\u0E2D\u0E14\u0E23\u0E27\u0E21",
    actions: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      onClick: () => onNavigate("review")
    }, "\u0E40\u0E1B\u0E34\u0E14\u0E04\u0E34\u0E27\u0E15\u0E23\u0E27\u0E08")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "var(--space-4)"
    }
  }, [["ใบสมัครรอตรวจ (AD-10)", "4", "ค้าง 5 วัน", "danger", "ในนี้ 2 ใบเอกสารไม่ครบ ต้องขอเพิ่ม"], ["ภาพหลักฐานรอตรวจ", String(QUEUE.length), "", "neutral", "เฉลี่ยรอ 1.2 วัน · เป้าหมายไม่เกิน 2 วัน"], ["แปลงที่หลักฐานยังไม่ครบ 4 ภาพ", String(needPhotos - gotPhotos), "กระทบเครดิต", "warning", "ต้องมีคู่ เปียก-แห้ง ครบ 2 รอบ จึงใช้ SF_w = 0.55 ได้"], ["แปลงที่ถอยไปใช้ SF_w = 0.71", String(fallbacks), "fallback", "danger", "ระบบบันทึก fallback_applied พร้อมเหตุผลไว้แล้ว"]].map(([t, v, tag, tone, note]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      border: "1px solid " + (tone === "danger" ? "#EFC9CB" : tone === "warning" ? "#F2DDB4" : "var(--border-subtle)"),
      background: tone === "danger" ? "var(--status-danger-soft)" : tone === "warning" ? "var(--status-warning-soft)" : "var(--white)",
      borderRadius: "var(--radius-md)",
      padding: "var(--space-4) var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: "8px",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)"
    }
  }, t), tag ? /*#__PURE__*/React.createElement(Badge, {
    tone: tone === "neutral" ? "neutral" : tone
  }, tag) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-3xl)",
      fontWeight: "var(--weight-light)",
      lineHeight: 1.1,
      margin: "var(--space-2) 0",
      color: "var(--text-heading)"
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "var(--text-subtle)",
      lineHeight: "var(--leading-relaxed)"
    }
  }, note))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.15fr 1fr",
      gap: "var(--space-6)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(Section, {
    title: "\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E23\u0E32\u0E22\u0E24\u0E14\u0E39 \u2014 \u0E01\u0E23\u0E13\u0E35\u0E10\u0E32\u0E19 \u0E40\u0E17\u0E35\u0E22\u0E1A \u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E01\u0E32\u0E23 \u0E40\u0E17\u0E35\u0E22\u0E1A \u0E17\u0E27\u0E19\u0E2A\u0E2D\u0E1A\u0E41\u0E25\u0E49\u0E27",
    sub: "\u0E2B\u0E19\u0E48\u0E27\u0E22 tCO\u2082eq \xB7 \u0E24\u0E14\u0E39 2569 \u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E40\u0E02\u0E49\u0E32\u0E23\u0E2D\u0E1A\u0E17\u0E27\u0E19\u0E2A\u0E2D\u0E1A"
  }, /*#__PURE__*/React.createElement(CreditChart, {
    seasons: SEASONS
  })), /*#__PURE__*/React.createElement(Section, {
    title: "\u0E1B\u0E23\u0E34\u0E21\u0E32\u0E13\u0E01\u0E4A\u0E32\u0E0B\u0E40\u0E23\u0E37\u0E2D\u0E19\u0E01\u0E23\u0E30\u0E08\u0E01\u0E41\u0E22\u0E01\u0E15\u0E32\u0E21\u0E41\u0E2B\u0E25\u0E48\u0E07 \xB7 \u0E1B\u0E35 2569",
    sub: "\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E0A\u0E35\u0E15 3.7 \u0E2A\u0E23\u0E38\u0E1BGHG \xB7 \u0E2B\u0E19\u0E48\u0E27\u0E22 tCO\u2082eq",
    pad: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    columns: [{
      key: "name",
      label: "แหล่งการปล่อย"
    }, {
      key: "be",
      label: "กรณีฐาน BE",
      align: "right",
      render: r => fmt(r.s1[0] + r.s2[0])
    }, {
      key: "pe",
      label: "โครงการ PE",
      align: "right",
      render: r => fmt(r.s1[1] + r.s2[1])
    }, {
      key: "d",
      label: "ส่วนต่าง",
      align: "right",
      render: r => {
        const d = r.s1[0] + r.s2[0] - (r.s1[1] + r.s2[1]);
        return /*#__PURE__*/React.createElement("b", {
          style: {
            color: d > 0 ? "var(--status-success)" : d < 0 ? "var(--status-danger)" : "var(--text-subtle)"
          }
        }, d > 0 ? "−" : d < 0 ? "+" : "", fmt(Math.abs(d)));
      }
    }, {
      key: "eq",
      label: "สมการ",
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)",
          fontSize: "10.5px",
          color: "var(--text-subtle)"
        }
      }, r.eq)
    }],
    rows: GHG_2569.rows
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-4) var(--space-6)",
      borderTop: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      gap: "7px",
      fontSize: "var(--text-xs)"
    }
  }, [["BE_y · การปล่อยกรณีฐาน", fmt(GHG_2569.be)], ["PE_y · การปล่อยจากการดำเนินโครงการ", fmt(GHG_2569.pe)], ["LE_y · นอกขอบเขตโครงการ", fmt(GHG_2569.le)], ["ส่วนหักความไม่แน่นอน U_d", "15%"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)"
    }
  }, v))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      paddingTop: "7px",
      borderTop: "1px solid var(--grey-200)",
      fontSize: "var(--text-sm)"
    }
  }, /*#__PURE__*/React.createElement("b", null, "ER_y \xB7 \u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E2A\u0E38\u0E17\u0E18\u0E34"), /*#__PURE__*/React.createElement("b", {
    style: {
      fontFamily: "var(--font-mono)",
      color: "var(--text-accent)"
    }
  }, fmt(GHG_2569.er), " tCO\u2082eq")), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-subtle)",
      lineHeight: "var(--leading-relaxed)"
    }
  }, "\u0E1B\u0E38\u0E4B\u0E22\u0E41\u0E25\u0E30\u0E22\u0E39\u0E40\u0E23\u0E35\u0E22\u0E40\u0E17\u0E48\u0E32\u0E01\u0E31\u0E19\u0E17\u0E31\u0E49\u0E07\u0E2A\u0E2D\u0E07\u0E1D\u0E31\u0E48\u0E07\u0E42\u0E14\u0E22\u0E40\u0E08\u0E15\u0E19\u0E32 \u2014 \u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E02\u0E2D\u0E43\u0E2B\u0E49\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23\u0E25\u0E14\u0E1B\u0E38\u0E4B\u0E22 \u0E2A\u0E48\u0E27\u0E19\u0E15\u0E48\u0E32\u0E07\u0E40\u0E01\u0E37\u0E2D\u0E1A\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14\u0E21\u0E32\u0E08\u0E32\u0E01\u0E21\u0E35\u0E40\u0E17\u0E19 (E-06 \xB7 E-07) \u0E41\u0E25\u0E30\u0E1D\u0E31\u0E48\u0E07\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23\u0E21\u0E35\u0E40\u0E0A\u0E37\u0E49\u0E2D\u0E40\u0E1E\u0E25\u0E34\u0E07\u0E2A\u0E39\u0E1A\u0E19\u0E49\u0E33\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E02\u0E36\u0E49\u0E19")))), /*#__PURE__*/React.createElement(Section, {
    title: "\u0E41\u0E22\u0E01\u0E15\u0E32\u0E21\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E41\u0E25\u0E30\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17\u0E1C\u0E39\u0E49\u0E2A\u0E19\u0E31\u0E1A\u0E2A\u0E19\u0E38\u0E19",
    pad: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    onRowClick: () => onNavigate("farmers"),
    columns: [{
      key: "name",
      label: "จังหวัด"
    }, {
      key: "note",
      label: "ขอบเขต"
    }, {
      key: "households",
      label: "ครัวเรือน",
      align: "right"
    }, {
      key: "rai",
      label: "ไร่",
      align: "right",
      render: r => fmt(r.rai, 1)
    }, {
      key: "credits",
      label: "ER (tCO₂eq)",
      align: "right",
      render: r => /*#__PURE__*/React.createElement("b", null, fmt(r.credits))
    }],
    rows: PROVINCES
  })));
}

// ===== AD-01 / AD-02 / AD-04 · คิวตรวจภาพ 4 ภาพต่อครอป =====
function ReviewScreen() {
  const [sel, setSel] = React.useState(QUEUE[0]);
  const [rejecting, setRejecting] = React.useState(false);
  const [decided, setDecided] = React.useState({});
  const decide = v => {
    setDecided({
      ...decided,
      [sel.id]: v
    });
    setRejecting(false);
  };
  const wet = sel.phase === "wet";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(PageTitle, {
    eyebrow: "AD-01 \xB7 \u0E04\u0E34\u0E27\u0E15\u0E23\u0E27\u0E08\u0E20\u0E32\u0E1E\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19",
    title: "\u0E15\u0E23\u0E27\u0E08\u0E20\u0E32\u0E1E\u0E17\u0E48\u0E2D\u0E27\u0E31\u0E14\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E19\u0E49\u0E33\u0E41\u0E25\u0E30 metadata",
    sub: "\u0E2B\u0E19\u0E36\u0E48\u0E07\u0E04\u0E23\u0E2D\u0E1B\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35 4 \u0E20\u0E32\u0E1E \u2014 \u0E40\u0E1B\u0E35\u0E22\u0E01 2 \u0E04\u0E23\u0E31\u0E49\u0E07 \u0E41\u0E2B\u0E49\u0E07 2 \u0E04\u0E23\u0E31\u0E49\u0E07 \u0E2A\u0E25\u0E31\u0E1A\u0E01\u0E31\u0E19 \xB7 \u0E04\u0E23\u0E1A\u0E17\u0E31\u0E49\u0E07 4 \u0E08\u0E36\u0E07\u0E43\u0E0A\u0E49 SF_w = 0.55 \u0E44\u0E14\u0E49",
    actions: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "download",
        size: 15
      })
    }, "\u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E01\u0E32\u0E23\u0E17\u0E27\u0E19\u0E2A\u0E2D\u0E1A")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(0,1fr) 420px",
      gap: "var(--space-6)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(Section, {
    title: "ภาพรอตรวจ " + QUEUE.length + " รายการ",
    sub: "\u0E23\u0E30\u0E1A\u0E38\u0E14\u0E49\u0E27\u0E22 CPA code \u0E41\u0E25\u0E30\u0E23\u0E2B\u0E31\u0E2A\u0E41\u0E1B\u0E25\u0E07\u0E22\u0E48\u0E2D\u0E22\u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19",
    pad: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    onRowClick: r => {
      setSel(r);
      setRejecting(false);
    },
    columns: [{
      key: "id",
      label: "รหัสภาพ"
    }, {
      key: "code",
      label: "CPA code"
    }, {
      key: "plot",
      label: "แปลงย่อย"
    }, {
      key: "round",
      label: "รอบ",
      render: r => /*#__PURE__*/React.createElement(Tag, {
        tone: r.phase === "wet" ? "navy" : "teal"
      }, r.round)
    }, {
      key: "water",
      label: "ระดับน้ำที่กรอก",
      align: "right"
    }, {
      key: "gps",
      label: "พิกัด",
      render: r => r.inside ? /*#__PURE__*/React.createElement(Badge, {
        tone: "success"
      }, "\u0E43\u0E19\u0E02\u0E2D\u0E1A\u0E40\u0E02\u0E15") : /*#__PURE__*/React.createElement(Badge, {
        tone: "danger"
      }, "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E1E\u0E34\u0E01\u0E31\u0E14")
    }, {
      key: "age",
      label: "อายุคำร้อง",
      align: "right"
    }, {
      key: "d",
      label: "ผล",
      render: r => decided[r.id] ? /*#__PURE__*/React.createElement(Badge, {
        tone: decided[r.id] === "ok" ? "success" : "danger"
      }, decided[r.id] === "ok" ? "อนุมัติ" : "ตีกลับ") : /*#__PURE__*/React.createElement(Badge, {
        tone: "neutral",
        dot: false
      }, "\u0E23\u0E2D\u0E15\u0E23\u0E27\u0E08")
    }],
    rows: QUEUE
  })), /*#__PURE__*/React.createElement(Section, {
    title: "\u0E04\u0E27\u0E32\u0E21\u0E04\u0E23\u0E1A\u0E16\u0E49\u0E27\u0E19\u0E02\u0E2D\u0E07\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E23\u0E32\u0E22\u0E41\u0E1B\u0E25\u0E07",
    sub: "\u0E15\u0E49\u0E2D\u0E07\u0E04\u0E23\u0E1A\u0E17\u0E31\u0E49\u0E07 4 \u0E20\u0E32\u0E1E\u0E08\u0E36\u0E07\u0E08\u0E30\u0E1B\u0E25\u0E14\u0E25\u0E47\u0E2D\u0E01 SF_w = 0.55 \xB7 \u0E44\u0E21\u0E48\u0E04\u0E23\u0E1A\u0E23\u0E30\u0E1A\u0E1A\u0E16\u0E2D\u0E22\u0E40\u0E1B\u0E47\u0E19 0.71 \u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34",
    pad: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    columns: [{
      key: "plot",
      label: "แปลงย่อย"
    }, {
      key: "rai",
      label: "ไร่",
      align: "right",
      render: r => fmt(r.rai, 2)
    }, {
      key: "rounds",
      label: "รอบภาพ (เปียก1 · แห้ง1 · เปียก2 · แห้ง2)",
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          display: "flex",
          gap: "5px"
        }
      }, PHOTO_ROUNDS.map((pr, i) => /*#__PURE__*/React.createElement("span", {
        key: pr.code,
        title: pr.name,
        style: {
          width: "26px",
          height: "20px",
          borderRadius: "4px",
          display: "grid",
          placeItems: "center",
          fontSize: "10px",
          fontWeight: 700,
          background: i < r.photosApproved ? pr.phase === "wet" ? "var(--navy-600)" : "var(--teal-600)" : "var(--grey-200)",
          color: i < r.photosApproved ? "#fff" : "var(--grey-500)"
        }
      }, pr.phase === "wet" ? "เปียก" : "แห้ง")))
    }, {
      key: "sfw",
      label: "SF_w ที่ใช้จริง",
      align: "right",
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)"
        }
      }, r.calcSfW.v.toFixed(2))
    }, {
      key: "fb",
      label: "",
      render: r => r.calcSfW.fallback ? /*#__PURE__*/React.createElement(Badge, {
        tone: "danger"
      }, "fallback") : /*#__PURE__*/React.createElement(Badge, {
        tone: "success"
      }, "\u0E15\u0E32\u0E21\u0E17\u0E35\u0E48\u0E40\u0E25\u0E37\u0E2D\u0E01")
    }, {
      key: "er",
      label: "ER (tCO₂eq)",
      align: "right",
      render: r => fmt(r.er, 3)
    }],
    rows: PLOTS.map(p => {
      const c = computePlotSeason(p);
      return {
        plot: p.plot,
        rai: p.rai,
        photosApproved: p.photosApproved,
        calcSfW: c.sfWpj,
        er: c.er
      };
    })
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "ตรวจภาพ " + sel.id,
    sub: sel.round + " · " + sel.stageName + " (" + sel.stage + ")",
    actions: /*#__PURE__*/React.createElement(Tag, {
      tone: "navy"
    }, sel.code)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      borderRadius: "var(--radius-md)",
      overflow: "hidden",
      aspectRatio: "4 / 3",
      background: "linear-gradient(180deg,#9FC7E8 0%,#CFE3B9 52%,#8FA95C 100%)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "50%",
      top: "22%",
      transform: "translateX(-50%)",
      width: "30px",
      height: "132px",
      background: "#E7EDF2",
      borderRadius: "4px",
      boxShadow: "0 0 0 1px rgba(0,0,0,.18)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: wet ? "4% 0 0 0" : "56% 0 0 0",
      background: "rgba(56,120,160,.72)"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "8px",
      bottom: "8px",
      background: "rgba(0,0,0,.6)",
      color: "#fff",
      fontFamily: "var(--font-mono)",
      fontSize: "10px",
      padding: "3px 7px",
      borderRadius: "5px"
    }
  }, sel.gps, " \xB7 ", sel.when), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: "8px",
      top: "8px"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: wet ? "info" : "success"
  }, wet ? "รอบเปียก" : "รอบแห้ง"))), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      overflow: "hidden"
    }
  }, [["ถ่ายผ่านกล้องของระบบ", sel.inside ? "ใช่ · LF-04" : "ไม่ใช่ — ส่งทางแชต", sel.inside], ["พิกัด ณ วินาทีที่กด", sel.gps, sel.inside], ["พิกัดอยู่ในขอบเขต WKT ของแปลง", sel.inside ? "อยู่ในขอบเขต" : "ตรวจไม่ได้", sel.inside], ["เวลาถ่าย", sel.when, true], ["ระดับน้ำในท่อที่เกษตรกรกรอก", sel.water, true], ["สอดคล้องกับรอบที่แจ้ง", wet ? "รอบเปียก · น้ำเต็มท่อ ✓" : "รอบแห้ง · น้ำต่ำกว่าผิวดิน ✓", true], ["อยู่ในช่วงกำหนดของรอบ", "อยู่ในช่วง", true]].map(([k, v, ok], i, arr) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: "var(--space-4)",
      padding: "9px 12px",
      borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--grey-100)",
      fontSize: "var(--text-xs)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--weight-semibold)",
      color: ok ? "var(--text-heading)" : "var(--status-danger)",
      textAlign: "right"
    }
  }, v)))), rejecting ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      padding: "var(--space-4)",
      background: "var(--status-danger-soft)",
      borderRadius: "var(--radius-md)",
      border: "1px solid #EFC9CB"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: "#8C2830"
    }
  }, "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E40\u0E2B\u0E15\u0E38\u0E1C\u0E25\u0E17\u0E35\u0E48\u0E15\u0E35\u0E01\u0E25\u0E31\u0E1A (AD-04)"), REJECT_REASONS.map(r => /*#__PURE__*/React.createElement(Checkbox, {
    key: r,
    label: r
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E17\u0E35\u0E48\u0E2A\u0E48\u0E07\u0E16\u0E36\u0E07\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23",
    hint: "\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23\u0E08\u0E30\u0E40\u0E2B\u0E47\u0E19\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E19\u0E35\u0E49\u0E43\u0E19\u0E41\u0E0A\u0E15 (PJ-09)"
  }, /*#__PURE__*/React.createElement(Textarea, {
    rows: 2,
    defaultValue: "\u0E0A\u0E48\u0E27\u0E22\u0E16\u0E48\u0E32\u0E22\u0E43\u0E2B\u0E21\u0E48\u0E43\u0E2B\u0E49\u0E40\u0E2B\u0E47\u0E19\u0E02\u0E35\u0E14\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E19\u0E49\u0E33\u0E43\u0E19\u0E17\u0E48\u0E2D\u0E0A\u0E31\u0E14 \u0E46 \u0E20\u0E32\u0E22\u0E43\u0E19\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48 14 \u0E01.\u0E22. \u0E19\u0E30\u0E04\u0E23\u0E31\u0E1A"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "8px"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm",
    onClick: () => setRejecting(false)
  }, "\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    fullWidth: true,
    onClick: () => decide("no")
  }, "\u0E2A\u0E48\u0E07\u0E01\u0E25\u0E31\u0E1A\u0E43\u0E2B\u0E49\u0E16\u0E48\u0E32\u0E22\u0E43\u0E2B\u0E21\u0E48"))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "8px"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    fullWidth: true,
    onClick: () => setRejecting(true)
  }, "\u0E15\u0E35\u0E01\u0E25\u0E31\u0E1A"), /*#__PURE__*/React.createElement(Button, {
    fullWidth: true,
    onClick: () => decide("ok"),
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 16
    })
  }, "\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E41\u0E25\u0E30\u0E2A\u0E48\u0E07\u0E40\u0E02\u0E49\u0E32\u0E04\u0E33\u0E19\u0E27\u0E13")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "var(--text-subtle)",
      lineHeight: "var(--leading-relaxed)"
    }
  }, "\u0E01\u0E32\u0E23\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34 (AD-03) \u0E2A\u0E48\u0E07\u0E04\u0E48\u0E32\u0E40\u0E02\u0E49\u0E32\u0E23\u0E30\u0E1A\u0E1A\u0E04\u0E33\u0E19\u0E27\u0E13\u0E17\u0E31\u0E19\u0E17\u0E35 (SY-05) \xB7 \u0E02\u0E31\u0E49\u0E19\u0E17\u0E35\u0E48 2 \u0E02\u0E2D\u0E07\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E04\u0E33\u0E19\u0E27\u0E13\u0E08\u0E30\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19 SF_w \u0E43\u0E2B\u0E21\u0E48\u0E17\u0E38\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07\u0E17\u0E35\u0E48\u0E08\u0E33\u0E19\u0E27\u0E19\u0E20\u0E32\u0E1E\u0E17\u0E35\u0E48\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19")))));
}
Object.assign(window, {
  OverviewScreen,
  ReviewScreen,
  fmtNum: fmt
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin_console/AdminScreens1.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin_console/AdminScreens2.jsx
try { (() => {
const {
  Button,
  Badge,
  Tag,
  Icon,
  StatTile,
  FilterBar,
  DataTable,
  ProgressBar,
  Field,
  Select,
  Checkbox
} = window.NetZeroCarbonDesignSystem_f3e7a8;
const f2 = (n, d = 2) => Number(n).toLocaleString(undefined, {
  minimumFractionDigits: d,
  maximumFractionDigits: d
});

// ===== AD-15 / AD-18 · เกษตรกรรายคน =====
function FarmersScreen({
  filters,
  onFilter
}) {
  const [sel, setSel] = React.useState(null);
  const [tab, setTab] = React.useState("แปลงและเอกสาร");
  const provFilter = filters.find(x => x.id === "prov").value;
  const rows = FARMERS.filter(f => provFilter.startsWith("ทั้งหมด") || f.prov === provFilter);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(PageTitle, {
    eyebrow: "\u0E17\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23",
    title: "\u0E14\u0E39\u0E23\u0E32\u0E22 CPA code \xB7 \u0E23\u0E32\u0E22\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48 \xB7 \u0E23\u0E32\u0E22\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17\u0E1C\u0E39\u0E49\u0E2A\u0E19\u0E31\u0E1A\u0E2A\u0E19\u0E38\u0E19",
    sub: rows.length + " ราย ตามตัวกรองปัจจุบัน · ชื่อและเลขบัตรเห็นได้เฉพาะบัญชีที่มีสิทธิ์ตรวจเอกสาร",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "upload",
        size: 15
      })
    }, "\u0E19\u0E33\u0E40\u0E02\u0E49\u0E32\u0E40\u0E1B\u0E47\u0E19\u0E0A\u0E38\u0E14 (AD-13)"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "download",
        size: 15
      })
    }, "\u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01\u0E23\u0E32\u0E22 CPA code"))
  }), /*#__PURE__*/React.createElement(FilterBar, {
    filters: filters,
    onChange: onFilter
  }), /*#__PURE__*/React.createElement(PdpaNote, null, "\u0E15\u0E32\u0E23\u0E32\u0E07\u0E19\u0E35\u0E49\u0E41\u0E2A\u0E14\u0E07\u0E0A\u0E37\u0E48\u0E2D\u0E44\u0E14\u0E49\u0E40\u0E1E\u0E23\u0E32\u0E30\u0E40\u0E1B\u0E47\u0E19\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E41\u0E2D\u0E14\u0E21\u0E34\u0E19 \xB7 \u0E17\u0E38\u0E01\u0E44\u0E1F\u0E25\u0E4C\u0E17\u0E35\u0E48\u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01\u0E41\u0E25\u0E30\u0E17\u0E38\u0E01\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32\u0E40\u0E2B\u0E47\u0E19 \u0E43\u0E0A\u0E49 CPA code \u0E41\u0E17\u0E19\u0E0A\u0E37\u0E48\u0E2D\u0E40\u0E2A\u0E21\u0E2D (PDPA \xB7 CS-02)"), /*#__PURE__*/React.createElement(Section, {
    title: "\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23",
    pad: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    onRowClick: r => {
      setSel(r);
      setTab("แปลงและเอกสาร");
    },
    columns: [{
      key: "code",
      label: "CPA code",
      render: r => /*#__PURE__*/React.createElement("b", {
        style: {
          fontFamily: "var(--font-mono)",
          fontSize: "12px"
        }
      }, r.code)
    }, {
      key: "name",
      label: "ชื่อ - นามสกุล"
    }, {
      key: "tambon",
      label: "พื้นที่",
      render: r => "ต." + r.tambon + " อ." + r.district
    }, {
      key: "sponsor",
      label: "ผู้สนับสนุน",
      render: r => /*#__PURE__*/React.createElement(Tag, {
        tone: "navy"
      }, r.sponsor)
    }, {
      key: "np",
      label: "แปลงย่อย",
      align: "right",
      render: r => r.plots.length
    }, {
      key: "rai",
      label: "ไร่",
      align: "right",
      render: r => f2(r.rai, 2)
    }, {
      key: "ph",
      label: "ภาพหลักฐาน",
      align: "right",
      render: r => r.photos + "/" + r.need
    }, {
      key: "be",
      label: "BE",
      align: "right",
      render: r => f2(r.be)
    }, {
      key: "pe",
      label: "PE",
      align: "right",
      render: r => f2(r.pe)
    }, {
      key: "er",
      label: "ER (tCO₂eq)",
      align: "right",
      render: r => /*#__PURE__*/React.createElement("b", {
        style: {
          color: "var(--text-accent)"
        }
      }, f2(r.er, 3))
    }, {
      key: "status",
      label: "สถานะหลักฐาน",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        tone: r.tone
      }, r.status)
    }],
    rows: rows
  })), sel ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(6,30,92,.42)",
      zIndex: 40,
      display: "flex",
      justifyContent: "flex-end"
    },
    onClick: () => setSel(null)
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: "min(760px,94vw)",
      background: "var(--surface-sunken)",
      height: "100%",
      overflowY: "auto",
      boxShadow: "var(--shadow-xl)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--gradient-deep)",
      color: "#fff",
      padding: "var(--space-6) var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-xs)",
      color: "var(--teal-300)"
    }
  }, sel.code), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "3px 0 0",
      fontSize: "var(--text-2xl)",
      fontWeight: "var(--weight-light)",
      color: "#fff"
    }
  }, sel.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: "rgba(255,255,255,.75)",
      marginTop: "4px"
    }
  }, "\u0E15.", sel.tambon, " \u0E2D.", sel.district, " \u0E08.", sel.prov, " \xB7 \u0E1C\u0E39\u0E49\u0E2A\u0E19\u0E31\u0E1A\u0E2A\u0E19\u0E38\u0E19 ", sel.sponsor)), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSel(null),
    style: {
      background: "rgba(255,255,255,.16)",
      border: "none",
      color: "#fff",
      width: "30px",
      height: "30px",
      borderRadius: "var(--radius-circle)",
      cursor: "pointer"
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-8)",
      marginTop: "var(--space-6)"
    }
  }, [[sel.plots.length + " แปลง", "แปลงย่อย"], [f2(sel.rai, 2) + " ไร่", "เนื้อที่รวม"], [sel.photos + "/" + sel.need, "ภาพหลักฐาน (4 ต่อครอป)"], [f2(sel.er, 3), "ER tCO₂eq"]].map(([v, l]) => /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xl)",
      fontWeight: "var(--weight-light)"
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "rgba(255,255,255,.66)"
    }
  }, l))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-1)",
      padding: "0 var(--space-8)",
      background: "var(--white)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, ["แปลงและเอกสาร", "การคำนวณเครดิต", "ที่มาของไนโตรเจน", "ภาพหลักฐาน", "ประวัติการแก้ไข"].map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setTab(t),
    style: {
      background: "none",
      border: "none",
      borderBottom: "2px solid " + (tab === t ? "var(--teal-600)" : "transparent"),
      padding: "13px 11px",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: tab === t ? "var(--teal-700)" : "var(--text-muted)"
    }
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-6) var(--space-8) var(--space-16)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)"
    }
  }, tab === "แปลงและเอกสาร" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Section, {
    title: "\u0E41\u0E1B\u0E25\u0E07\u0E22\u0E48\u0E2D\u0E22\u0E43\u0E19\u0E17\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19",
    sub: "\u0E23\u0E2B\u0E31\u0E2A\u0E41\u0E1B\u0E25\u0E07\u0E23\u0E30\u0E1A\u0E1A\u0E23\u0E31\u0E19\u0E43\u0E2B\u0E49\u0E40\u0E2D\u0E07 \u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49 (SY-07)",
    pad: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    columns: [{
      key: "plot",
      label: "รหัสแปลงย่อย"
    }, {
      key: "deed",
      label: "เลขโฉนด"
    }, {
      key: "rai",
      label: "ไร่",
      align: "right",
      render: r => f2(r.rai, 2)
    }, {
      key: "rice",
      label: "พันธุ์ข้าว"
    }, {
      key: "days",
      label: "รอบปลูก (วัน)",
      align: "right"
    }, {
      key: "ph",
      label: "ภาพ",
      align: "right",
      render: r => r.photosApproved + "/4"
    }, {
      key: "wkt",
      label: "ขอบแปลง",
      render: () => /*#__PURE__*/React.createElement(Badge, {
        tone: "success"
      }, "\u0E21\u0E35 WKT")
    }],
    rows: sel.plots
  })), /*#__PURE__*/React.createElement(Section, {
    title: "\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E41\u0E25\u0E30\u0E04\u0E27\u0E32\u0E21\u0E22\u0E34\u0E19\u0E22\u0E2D\u0E21 (AD-15)",
    sub: "\u0E17\u0E38\u0E01\u0E09\u0E1A\u0E31\u0E1A\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E0B\u0E47\u0E19\u0E23\u0E31\u0E1A\u0E23\u0E2D\u0E07\u0E2A\u0E33\u0E40\u0E19\u0E32\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 \u0E41\u0E25\u0E30\u0E23\u0E30\u0E1A\u0E38\u0E27\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17\u0E40\u0E19\u0E17\u0E0B\u0E35\u0E42\u0E23\u0E04\u0E32\u0E23\u0E4C\u0E1A\u0E2D\u0E19 \u0E08\u0E33\u0E01\u0E31\u0E14"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-3)"
    }
  }, [["DOC-01", "โฉนดที่ดิน หน้า-หลัง", "ตรวจแล้ว", "success"], ["DOC-03", "สำเนาบัตรประชาชน", "ตรวจแล้ว", "success"], ["DOC-07", "สำเนาหน้าสมุดบัญชีธนาคาร", "ตรวจแล้ว", "success"], ["DOC-06", "หนังสือมอบอำนาจ (เจ้าของร่วม)", sel.plots.length > 1 ? "ตรวจแล้ว" : "ไม่บังคับ", sel.plots.length > 1 ? "success" : "neutral"], ["DOC-05", "หนังสือรับรองตนเอง กรณีจำนอง", "ไม่บังคับ", "neutral"], ["CS-01", "ยินยอม PDPA · v1.2", "19 ก.ค. 69 09:41", "success"], ["CS-03", "สิทธิ์ในคาร์บอนเครดิต · v1.1", "19 ก.ค. 69 09:43", "success"], ["CS-04", "ภาพถ่ายและพิกัด · v1.1", "19 ก.ค. 69 09:43", "success"]].map(([c, n, st, tone]) => /*#__PURE__*/React.createElement("div", {
    key: c,
    style: {
      display: "flex",
      gap: "10px",
      alignItems: "center",
      padding: "10px 12px",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-sm)",
      background: "var(--white)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: tone === "success" ? "file-check" : "file",
    size: 17
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontFamily: "var(--font-mono)",
      fontSize: "10px",
      color: "var(--text-subtle)"
    }
  }, c), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "12.5px",
      fontWeight: "var(--weight-semibold)"
    }
  }, n)), /*#__PURE__*/React.createElement(Badge, {
    tone: tone
  }, st)))))) : null, tab === "การคำนวณเครดิต" ? /*#__PURE__*/React.createElement(CalcTrace, {
    plot: sel.plots[0]
  }) : null, tab === "ที่มาของไนโตรเจน" ? /*#__PURE__*/React.createElement(Section, {
    title: "\u0E15\u0E23\u0E27\u0E08\u0E17\u0E35\u0E48\u0E21\u0E32\u0E02\u0E2D\u0E07\u0E44\u0E19\u0E42\u0E15\u0E23\u0E40\u0E08\u0E19\u0E23\u0E32\u0E22\u0E04\u0E23\u0E31\u0E49\u0E07 (AD-18 \xB7 F-71)",
    sub: "\u0E41\u0E2A\u0E14\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E2A\u0E21\u0E01\u0E32\u0E23\u0E40\u0E15\u0E47\u0E21 \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E41\u0E04\u0E48\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C \u2014 \u0E01\u0E14\u0E14\u0E39\u0E44\u0E14\u0E49\u0E27\u0E48\u0E32\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02\u0E21\u0E32\u0E08\u0E32\u0E01\u0E44\u0E2B\u0E19",
    pad: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    columns: [{
      key: "no",
      label: "ครั้งที่",
      align: "right"
    }, {
      key: "stage",
      label: "ขั้น"
    }, {
      key: "formula",
      label: "สูตรที่เกษตรกรให้",
      render: r => /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, r.formula), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "10.5px",
          color: "var(--text-subtle)"
        }
      }, r.src))
    }, {
      key: "pctN",
      label: "%N ที่ระบบอ่านได้",
      align: "right"
    }, {
      key: "rate",
      label: "อัตรา (กก./ไร่)",
      align: "right"
    }, {
      key: "n",
      label: "ไนโตรเจนต่อครั้ง",
      align: "right",
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)",
          fontSize: "11px"
        }
      }, r.rate, " \xD7 ", r.pctN, " \xF7 100 = ", /*#__PURE__*/React.createElement("b", null, (r.rate * r.pctN / 100).toFixed(2)))
    }, {
      key: "urea",
      label: "is_urea",
      render: r => r.urea ? /*#__PURE__*/React.createElement(Badge, {
        tone: "info"
      }, "\u0E22\u0E39\u0E40\u0E23\u0E35\u0E22") : /*#__PURE__*/React.createElement(Badge, {
        tone: "neutral",
        dot: false
      }, "\u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48")
    }, {
      key: "photo",
      label: "ภาพถุงปุ๋ย",
      render: r => r.photo ? /*#__PURE__*/React.createElement(Badge, {
        tone: "success"
      }, "\u0E21\u0E35") : /*#__PURE__*/React.createElement(Badge, {
        tone: "warning"
      }, "\u0E44\u0E21\u0E48\u0E21\u0E35")
    }],
    rows: NITROGEN_ROWS
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-4) var(--space-6)",
      borderTop: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      fontSize: "var(--text-sm)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)"
    }
  }, "\u0E22\u0E2D\u0E14\u0E23\u0E27\u0E21\u0E44\u0E19\u0E42\u0E15\u0E23\u0E40\u0E08\u0E19\u0E23\u0E32\u0E22\u0E24\u0E14\u0E39 \u2014 \u0E15\u0E49\u0E2D\u0E07\u0E40\u0E17\u0E48\u0E32\u0E01\u0E31\u0E1A\u0E1C\u0E25\u0E23\u0E27\u0E21\u0E23\u0E32\u0E22\u0E04\u0E23\u0E31\u0E49\u0E07\u0E40\u0E2A\u0E21\u0E2D"), /*#__PURE__*/React.createElement("b", {
    style: {
      fontFamily: "var(--font-mono)"
    }
  }, NITROGEN_ROWS.reduce((s, r) => s + r.rate * r.pctN / 100, 0).toFixed(2), " \u0E01\u0E01.N/\u0E44\u0E23\u0E48")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "var(--text-subtle)",
      lineHeight: "var(--leading-relaxed)"
    }
  }, "\u0E1B\u0E23\u0E34\u0E21\u0E32\u0E13\u0E1B\u0E38\u0E4B\u0E22\u0E1D\u0E31\u0E48\u0E07\u0E01\u0E23\u0E13\u0E35\u0E10\u0E32\u0E19\u0E41\u0E25\u0E30\u0E1D\u0E31\u0E48\u0E07\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E04\u0E48\u0E32\u0E40\u0E14\u0E35\u0E22\u0E27\u0E01\u0E31\u0E19\u0E42\u0E14\u0E22\u0E40\u0E08\u0E15\u0E19\u0E32 \u2014 \u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23\u0E44\u0E21\u0E48\u0E21\u0E35\u0E27\u0E31\u0E15\u0E16\u0E38\u0E1B\u0E23\u0E30\u0E2A\u0E07\u0E04\u0E4C\u0E43\u0E2B\u0E49\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23\u0E25\u0E14\u0E1B\u0E38\u0E4B\u0E22 \u0E44\u0E19\u0E42\u0E15\u0E23\u0E40\u0E08\u0E19\u0E08\u0E36\u0E07\u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E41\u0E2B\u0E25\u0E48\u0E07\u0E02\u0E2D\u0E07\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15 \u0E41\u0E15\u0E48\u0E22\u0E31\u0E07\u0E15\u0E49\u0E2D\u0E07\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E43\u0E2B\u0E49\u0E04\u0E23\u0E1A\u0E40\u0E1E\u0E23\u0E32\u0E30\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E21\u0E01\u0E32\u0E23 N\u2082O \u0E17\u0E31\u0E49\u0E07\u0E2A\u0E2D\u0E07\u0E1D\u0E31\u0E48\u0E07"))) : null, tab === "ภาพหลักฐาน" ? /*#__PURE__*/React.createElement(Section, {
    title: "\u0E20\u0E32\u0E1E\u0E17\u0E48\u0E2D\u0E27\u0E31\u0E14\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E19\u0E49\u0E33 4 \u0E23\u0E2D\u0E1A\u0E02\u0E2D\u0E07\u0E04\u0E23\u0E2D\u0E1B\u0E19\u0E35\u0E49",
    sub: "\u0E40\u0E1B\u0E35\u0E22\u0E01 2 \u0E04\u0E23\u0E31\u0E49\u0E07 \u0E41\u0E2B\u0E49\u0E07 2 \u0E04\u0E23\u0E31\u0E49\u0E07 \u0E2A\u0E25\u0E31\u0E1A\u0E01\u0E31\u0E19 \u2014 \u0E17\u0E38\u0E01\u0E20\u0E32\u0E1E\u0E16\u0E48\u0E32\u0E22\u0E1C\u0E48\u0E32\u0E19\u0E01\u0E25\u0E49\u0E2D\u0E07\u0E02\u0E2D\u0E07\u0E23\u0E30\u0E1A\u0E1A"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "var(--space-3)"
    }
  }, PHOTO_ROUNDS.map((pr, i) => {
    const ok = i < sel.plots[0].photosApproved;
    return /*#__PURE__*/React.createElement("div", {
      key: pr.code,
      style: {
        borderRadius: "var(--radius-sm)",
        overflow: "hidden",
        border: "1px solid " + (ok ? "var(--border-subtle)" : "var(--status-warning)")
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        aspectRatio: "4 / 3",
        background: ok ? "linear-gradient(180deg,#9FC7E8,#8FA95C)" : "var(--grey-100)"
      }
    }, ok ? /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        left: "50%",
        top: "22%",
        transform: "translateX(-50%)",
        width: "14px",
        height: "50px",
        background: "#E7EDF2",
        borderRadius: "2px",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        inset: pr.phase === "wet" ? "6% 0 0 0" : "58% 0 0 0",
        background: "rgba(56,120,160,.75)"
      }
    })) : /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        color: "var(--grey-400)",
        fontSize: "20px"
      }
    }, "\u2014")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "7px 8px",
        background: "#fff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "9.5px",
        color: "var(--text-subtle)"
      }
    }, pr.code, " \xB7 ", pr.stage, " \xB7 \u0E27\u0E31\u0E19\u0E17\u0E35\u0E48 ", pr.day), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "3px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "11px",
        fontWeight: "var(--weight-semibold)"
      }
    }, pr.phase === "wet" ? "เปียก" : "แห้ง"), /*#__PURE__*/React.createElement(Badge, {
      tone: ok ? "success" : "warning"
    }, ok ? "อนุมัติ" : "ยังไม่ส่ง"))));
  }))) : null, tab === "ประวัติการแก้ไข" ? /*#__PURE__*/React.createElement(Section, {
    title: "Audit log (AD-11)",
    sub: "\u0E43\u0E04\u0E23 \u0E40\u0E21\u0E37\u0E48\u0E2D\u0E44\u0E23 \u0E04\u0E48\u0E32\u0E01\u0E48\u0E2D\u0E19-\u0E2B\u0E25\u0E31\u0E07 \u2014 \u0E43\u0E0A\u0E49\u0E15\u0E2D\u0E1A\u0E1C\u0E39\u0E49\u0E17\u0E27\u0E19\u0E2A\u0E2D\u0E1A",
    pad: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    columns: [{
      key: "t",
      label: "เวลา"
    }, {
      key: "who",
      label: "ผู้ใช้"
    }, {
      key: "what",
      label: "รายการ"
    }, {
      key: "before",
      label: "ก่อน"
    }, {
      key: "after",
      label: "หลัง"
    }],
    rows: [{
      t: "20 ส.ค. 10:12",
      who: "admin@nzc",
      what: "อนุมัติภาพ PH-8841 (DRY-1)",
      before: "pending",
      after: "approved"
    }, {
      t: "20 ส.ค. 10:12",
      who: "ระบบ (calc_run)",
      what: "ตัดสิน SF_w ใหม่หลังอนุมัติภาพ",
      before: "0.71 (fallback)",
      after: "0.55"
    }, {
      t: "19 ส.ค. 07:42",
      who: "ระบบ (LIFF)",
      what: "บันทึกระดับน้ำ DRY-1",
      before: "—",
      after: "10 ซม."
    }, {
      t: "19 ก.ค. 09:43",
      who: "เกษตรกร",
      what: "ยินยอม CS-02 ถึง CS-04",
      before: "—",
      after: "v1.1"
    }]
  })) : null))) : null);
}

// ===== ลำดับการคำนวณ 12 ขั้น (ชีต 5_ลำดับการคำนวณ) กางให้เห็นทีละขั้น =====
function CalcTrace({
  plot
}) {
  const c = computePlotSeason(plot);
  const row = (k, v, eq) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: "var(--space-4)",
      padding: "8px 0",
      borderBottom: "1px dashed var(--grey-200)",
      fontSize: "var(--text-xs)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)"
    }
  }, k, eq ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      color: "var(--text-subtle)",
      marginLeft: "6px"
    }
  }, eq) : null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontWeight: "var(--weight-semibold)",
      textAlign: "right"
    }
  }, v));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Section, {
    title: "การคำนวณของแปลง " + plot.plot,
    sub: "เนื้อที่ " + f2(plot.rai, 2) + " ไร่ · " + plot.rice + " · รอบปลูก " + plot.days + " วัน · แนวทางการประเมินที่ 3"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)",
      marginBottom: "var(--space-2)"
    }
  }, "\u0E01\u0E23\u0E13\u0E35\u0E10\u0E32\u0E19 (BL)"), row("การจัดการน้ำระหว่างฤดู", SF_W[plot.bl.wwCode].label, "B-02"), row("SF_w", c.sfWbl.v.toFixed(2), ""), row("SF_p", SF_P[plot.bl.sfP].v.toFixed(2), "B-01"), row("SF_o", c.BL.sfO.toFixed(4), "E-08"), row("EF_CH4", c.BL.ef.toFixed(6) + " กก./ไร่/วัน", "E-07"), row("CH4_SOIL ก่อนคูณ CF", f2(c.BL.ch4, 4), "E-06"), row("× CF = 0.89", f2(c.BL.ch4Applied, 4), "E-03"), row("CO2_LIME", f2(c.BL.lime, 4), "E-09"), row("CO2_UREA", f2(c.BL.urea, 4), "E-10"), row("N2O_SOIL", f2(c.BL.n2o, 4), "E-11"), row("BE_s รวม", f2(c.be, 4) + " tCO₂eq", "E-03")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)",
      marginBottom: "var(--space-2)"
    }
  }, "\u0E01\u0E23\u0E13\u0E35\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23 (PJ)"), row("การจัดการน้ำระหว่างฤดู", SF_W[plot.pj.wwCode].label, "B-02"), row("SF_w ที่ใช้จริง", c.sfWpj.v.toFixed(2) + (c.sfWpj.fallback ? " ← fallback" : ""), ""), row("SF_p", SF_P[plot.pj.sfP].v.toFixed(2), "B-01"), row("SF_o", c.PJ.sfO.toFixed(4), "E-08"), row("EF_CH4", c.PJ.ef.toFixed(6) + " กก./ไร่/วัน", "E-07"), row("CH4_SOIL (ไม่คูณ CF)", f2(c.PJ.ch4Applied, 4), "E-06"), row("CO2_LIME", f2(c.PJ.lime, 4), "E-09"), row("CO2_UREA", f2(c.PJ.urea, 4), "E-10"), row("N2O_SOIL", f2(c.PJ.n2o, 4), "E-11"), row("CO2_FUEL (สูบน้ำเพิ่ม)", f2(c.PJ.fuel, 4), "E-17"), row("PE_s รวม", f2(c.pe, 4) + " tCO₂eq", "E-05"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-6)",
      padding: "var(--space-5)",
      background: "var(--surface-accent-soft)",
      borderRadius: "var(--radius-md)",
      display: "flex",
      flexDirection: "column",
      gap: "7px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-xs)",
      color: "var(--teal-800)"
    }
  }, "ER = (BE \u2212 PE \u2212 LE) \xD7 (1 \u2212 U_d) = (", f2(c.be, 4), " \u2212 ", f2(c.pe, 4), " \u2212 0) \xD7 0.85"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-3xl)",
      fontWeight: "var(--weight-light)",
      color: "var(--teal-800)",
      fontFamily: "var(--font-mono)"
    }
  }, f2(c.er, 4)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--teal-800)"
    }
  }, "tCO\u2082eq \u0E15\u0E48\u0E2D\u0E24\u0E14\u0E39")))), /*#__PURE__*/React.createElement(Section, {
    title: "\u0E02\u0E31\u0E49\u0E19\u0E17\u0E35\u0E48 2 \xB7 \u0E15\u0E23\u0E27\u0E08\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E19\u0E49\u0E33\u0E41\u0E25\u0E30\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19 SF_w",
    sub: "\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E01\u0E34\u0E14\u0E01\u0E48\u0E2D\u0E19\u0E02\u0E31\u0E49\u0E19\u0E17\u0E35\u0E48 5 \u0E40\u0E2A\u0E21\u0E2D \u0E21\u0E34\u0E09\u0E30\u0E19\u0E31\u0E49\u0E19\u0E08\u0E30\u0E04\u0E33\u0E19\u0E27\u0E13\u0E14\u0E49\u0E27\u0E22\u0E04\u0E48\u0E32\u0E17\u0E35\u0E48\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A",
    actions: /*#__PURE__*/React.createElement(Badge, {
      tone: c.sfWpj.fallback ? "danger" : "success"
    }, c.sfWpj.fallback ? "fallback_applied" : "ตามที่เลือก")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3)",
      marginBottom: "var(--space-4)"
    }
  }, PHOTO_ROUNDS.map((pr, i) => {
    const ok = i < plot.photosApproved;
    return /*#__PURE__*/React.createElement("div", {
      key: pr.code,
      style: {
        flex: 1,
        padding: "var(--space-4)",
        borderRadius: "var(--radius-md)",
        border: "1px solid " + (ok ? "var(--teal-200)" : "var(--border-default)"),
        background: ok ? "var(--teal-50)" : "var(--white)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        color: "var(--text-subtle)"
      }
    }, pr.code, " \xB7 ", pr.stage), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: "var(--weight-semibold)",
        margin: "3px 0 5px"
      }
    }, pr.name), /*#__PURE__*/React.createElement(Badge, {
      tone: ok ? "success" : "warning"
    }, ok ? "อนุมัติแล้ว" : "ยังไม่มีภาพ"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "10.5px",
        color: "var(--text-subtle)",
        marginTop: "6px",
        lineHeight: "var(--leading-relaxed)"
      }
    }, "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48 ", pr.day, " \u0E2B\u0E25\u0E31\u0E07\u0E2B\u0E27\u0E48\u0E32\u0E19"));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xs)",
      lineHeight: "var(--leading-relaxed)",
      color: c.sfWpj.fallback ? "#8C2830" : "var(--text-muted)",
      padding: "var(--space-4)",
      background: c.sfWpj.fallback ? "var(--status-danger-soft)" : "var(--surface-sunken)",
      borderRadius: "var(--radius-md)"
    }
  }, c.sfWpj.reason, " \u2014 ", c.sfWpj.fallback ? "ระบบถอยไปใช้ SF_w = " + c.sfWpj.v.toFixed(2) + " (WW-2) และบันทึก fallback_applied พร้อมเหตุผลไว้ในตาราง calc_result ผู้ทวนสอบจะเห็นว่าทำไมเครดิตต่ำกว่าที่ควรได้" : "ใช้ SF_w = " + c.sfWpj.v.toFixed(2) + " ตามรหัส WW-3 (เปียกสลับแห้ง) ได้เต็มค่า")));
}

// ===== AD-07 · ส่งออกรายงาน =====
function ReportsScreen() {
  const [picked, setPicked] = React.useState("EX-2043");
  const ex = EXPORTS.find(e => e.id === picked);
  const complete = Math.round(FARMERS.reduce((s, f) => s + f.photos, 0) / FARMERS.reduce((s, f) => s + f.need, 0) * 100);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(PageTitle, {
    eyebrow: "AD-07 \xB7 \u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19",
    title: "\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E41\u0E25\u0E30\u0E44\u0E1F\u0E25\u0E4C\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E22\u0E37\u0E48\u0E19\u0E02\u0E36\u0E49\u0E19\u0E17\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19",
    sub: "\u0E42\u0E04\u0E23\u0E07\u0E40\u0E14\u0E35\u0E22\u0E27\u0E01\u0E31\u0E1A\u0E44\u0E1F\u0E25\u0E4C\u0E04\u0E33\u0E19\u0E27\u0E13\u0E17\u0E35\u0E48\u0E43\u0E0A\u0E49\u0E2D\u0E22\u0E39\u0E48 \xB7 \u0E17\u0E38\u0E01\u0E44\u0E1F\u0E25\u0E4C\u0E43\u0E0A\u0E49 CPA code \u0E41\u0E17\u0E19\u0E0A\u0E37\u0E48\u0E2D"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(0,1fr) 380px",
      gap: "var(--space-6)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(Section, {
    title: "\u0E0A\u0E38\u0E14\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E17\u0E35\u0E48\u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01\u0E44\u0E14\u0E49",
    pad: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    onRowClick: r => setPicked(r.id),
    columns: [{
      key: "name",
      label: "รายงาน",
      render: r => /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, r.name), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "11px",
          color: "var(--text-subtle)"
        }
      }, r.note))
    }, {
      key: "fmt",
      label: "รูปแบบ",
      render: r => /*#__PURE__*/React.createElement(Tag, {
        tone: r.fmt === "DOCX" ? "navy" : "teal"
      }, r.fmt)
    }, {
      key: "scope",
      label: "ขอบเขต"
    }, {
      key: "who",
      label: "ใครดาวน์โหลดได้"
    }],
    rows: EXPORTS
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(Section, {
    title: "\u0E22\u0E37\u0E48\u0E19\u0E02\u0E36\u0E49\u0E19\u0E17\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19 Premium T-VER",
    sub: "T-VER-P-METH-13-08 \u0E09\u0E1A\u0E31\u0E1A\u0E17\u0E35\u0E48 01"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "9px"
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    label: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E23\u0E13\u0E35\u0E10\u0E32\u0E19 3 \u0E1B\u0E35",
    value: 71,
    max: 100,
    valueLabel: "71%"
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E04\u0E23\u0E1A",
    value: 88,
    max: 100,
    valueLabel: "88%",
    tone: "mint"
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "\u0E20\u0E32\u0E1E\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19 4 \u0E20\u0E32\u0E1E/\u0E04\u0E23\u0E2D\u0E1B",
    value: complete,
    max: 100,
    valueLabel: complete + "%",
    tone: "navy"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-4)",
      background: "var(--status-warning-soft)",
      border: "1px solid #F2DDB4",
      borderRadius: "var(--radius-md)",
      fontSize: "var(--text-xs)",
      lineHeight: "var(--leading-relaxed)",
      color: "#8A5B10"
    }
  }, "\u0E22\u0E31\u0E07\u0E22\u0E37\u0E48\u0E19\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49 \u2014 \u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E23\u0E13\u0E35\u0E10\u0E32\u0E19\u0E04\u0E23\u0E1A 100% \u0E41\u0E25\u0E30\u0E20\u0E32\u0E1E\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E04\u0E23\u0E1A 4 \u0E23\u0E2D\u0E1A\u0E02\u0E2D\u0E07\u0E17\u0E38\u0E01\u0E41\u0E1B\u0E25\u0E07 \u0E21\u0E34\u0E09\u0E30\u0E19\u0E31\u0E49\u0E19\u0E41\u0E1B\u0E25\u0E07\u0E17\u0E35\u0E48\u0E02\u0E32\u0E14\u0E08\u0E30\u0E16\u0E39\u0E01\u0E04\u0E34\u0E14\u0E14\u0E49\u0E27\u0E22 SF_w = 0.71 \u0E17\u0E33\u0E43\u0E2B\u0E49\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E23\u0E27\u0E21\u0E15\u0E48\u0E33\u0E01\u0E27\u0E48\u0E32\u0E17\u0E35\u0E48\u0E04\u0E27\u0E23\u0E44\u0E14\u0E49"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "8px"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    fullWidth: true,
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "file-text",
      size: 16
    })
  }, "\u0E14\u0E32\u0E27\u0E19\u0E4C\u0E42\u0E2B\u0E25\u0E14 Word \xB7 \u0E41\u0E1A\u0E1A\u0E1F\u0E2D\u0E23\u0E4C\u0E21\u0E02\u0E2D\u0E02\u0E36\u0E49\u0E19\u0E17\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    fullWidth: true,
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "table",
      size: 16
    })
  }, "\u0E14\u0E32\u0E27\u0E19\u0E4C\u0E42\u0E2B\u0E25\u0E14 Excel \xB7 \u0E44\u0E1F\u0E25\u0E4C\u0E04\u0E33\u0E19\u0E27\u0E13\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15"), /*#__PURE__*/React.createElement(Button, {
    fullWidth: true,
    disabled: true
  }, "\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E0A\u0E38\u0E14\u0E22\u0E37\u0E48\u0E19 (\u0E25\u0E47\u0E2D\u0E01\u0E44\u0E27\u0E49\u0E08\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E04\u0E23\u0E1A)")))), /*#__PURE__*/React.createElement(Section, {
    title: "ตัวอย่างที่เลือก · " + ex.id,
    sub: ex.name
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      fontSize: "var(--text-xs)"
    }
  }, [["รูปแบบ", ex.fmt], ["ขอบเขต", ex.scope], ["สิทธิ์ดาวน์โหลด", ex.who], ["ตัวระบุเกษตรกร", "CPA code (PDPA)"], ["บันทึกการดาวน์โหลด", "ลง audit log ทุกครั้ง"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: "var(--space-4)",
      paddingBottom: "7px",
      borderBottom: "1px dashed var(--grey-200)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--weight-semibold)",
      textAlign: "right"
    }
  }, v))), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-subtle)",
      lineHeight: "var(--leading-relaxed)"
    }
  }, ex.note), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    fullWidth: true,
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "download",
      size: 15
    })
  }, "\u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01\u0E44\u0E1F\u0E25\u0E4C\u0E19\u0E35\u0E49"))))));
}

// ===== F-65 · สิทธิ์ของบริษัทผู้สนับสนุน =====
function SponsorsScreen() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(PageTitle, {
    eyebrow: "F-65 \xB7 \u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E02\u0E2D\u0E07\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32",
    title: "\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17\u0E1C\u0E39\u0E49\u0E2A\u0E19\u0E31\u0E1A\u0E2A\u0E19\u0E38\u0E19\u0E41\u0E25\u0E30\u0E02\u0E2D\u0E1A\u0E40\u0E02\u0E15\u0E17\u0E35\u0E48\u0E21\u0E2D\u0E07\u0E40\u0E2B\u0E47\u0E19\u0E44\u0E14\u0E49",
    sub: "\u0E41\u0E2D\u0E14\u0E21\u0E34\u0E19\u0E40\u0E1B\u0E47\u0E19\u0E1C\u0E39\u0E49\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E27\u0E48\u0E32\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32\u0E40\u0E2B\u0E47\u0E19\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E43\u0E14\u0E44\u0E14\u0E49 \xB7 \u0E25\u0E39\u0E01\u0E04\u0E49\u0E32\u0E44\u0E21\u0E48\u0E40\u0E2B\u0E47\u0E19\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E02\u0E2D\u0E07\u0E1C\u0E39\u0E49\u0E2A\u0E19\u0E31\u0E1A\u0E2A\u0E19\u0E38\u0E19\u0E23\u0E32\u0E22\u0E2D\u0E37\u0E48\u0E19",
    actions: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "plus",
        size: 15
      })
    }, "\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17")
  }), SPONSORS.map(s => /*#__PURE__*/React.createElement(Section, {
    key: s.id,
    title: s.name,
    sub: "ครัวเรือน " + s.households + " · " + f2(s.rai, 1) + " ไร่ · ทวนสอบแล้ว " + f2(s.verified) + " tCO₂eq",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost"
    }, "\u0E14\u0E39\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E17\u0E35\u0E48\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32\u0E40\u0E2B\u0E47\u0E19"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline"
    }, "\u0E41\u0E01\u0E49\u0E44\u0E02\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)"
    }
  }, "\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E17\u0E35\u0E48\u0E40\u0E2B\u0E47\u0E19\u0E44\u0E14\u0E49"), PROVINCES.map(p => /*#__PURE__*/React.createElement(Checkbox, {
    key: p.name,
    label: p.name + " · " + p.tambon + " ตำบล · " + f2(p.rai, 1) + " ไร่",
    defaultChecked: s.areas.includes(p.name)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)"
    }
  }, "\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E17\u0E35\u0E48\u0E40\u0E2B\u0E47\u0E19\u0E44\u0E14\u0E49"), /*#__PURE__*/React.createElement(Checkbox, {
    label: "\u0E22\u0E2D\u0E14\u0E23\u0E27\u0E21\u0E23\u0E32\u0E22\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E41\u0E25\u0E30\u0E23\u0E32\u0E22\u0E24\u0E14\u0E39",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E01\u0E32\u0E23 (\u0E01\u0E48\u0E2D\u0E19\u0E17\u0E27\u0E19\u0E2A\u0E2D\u0E1A)",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E17\u0E35\u0E48\u0E23\u0E31\u0E1A\u0E23\u0E2D\u0E07\u0E41\u0E25\u0E49\u0E27",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "\u0E20\u0E32\u0E1E\u0E16\u0E48\u0E32\u0E22\u0E41\u0E1B\u0E25\u0E07 (\u0E44\u0E21\u0E48\u0E23\u0E30\u0E1A\u0E38\u0E15\u0E31\u0E27\u0E1A\u0E38\u0E04\u0E04\u0E25)",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E23\u0E32\u0E22\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23 (\u0E0A\u0E37\u0E48\u0E2D \u0E40\u0E1A\u0E2D\u0E23\u0E4C \u0E40\u0E25\u0E02\u0E42\u0E09\u0E19\u0E14)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "var(--text-subtle)",
      lineHeight: "var(--leading-relaxed)"
    }
  }, "\u0E0A\u0E48\u0E2D\u0E07\u0E2A\u0E38\u0E14\u0E17\u0E49\u0E32\u0E22\u0E1B\u0E34\u0E14\u0E44\u0E27\u0E49\u0E15\u0E32\u0E21\u0E02\u0E49\u0E2D\u0E15\u0E01\u0E25\u0E07\u0E04\u0E27\u0E32\u0E21\u0E22\u0E34\u0E19\u0E22\u0E2D\u0E21 CS-02 \u2014 \u0E40\u0E1B\u0E34\u0E14\u0E44\u0E14\u0E49\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E21\u0E35\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E04\u0E27\u0E32\u0E21\u0E22\u0E34\u0E19\u0E22\u0E2D\u0E21\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E15\u0E34\u0E21\u0E23\u0E32\u0E22\u0E1A\u0E38\u0E04\u0E04\u0E25"))))));
}
Object.assign(window, {
  FarmersScreen,
  ReportsScreen,
  SponsorsScreen,
  CalcTrace
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin_console/AdminScreens2.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin_console/AdminScreens3.jsx
try { (() => {
const {
  Button,
  Badge,
  Tag,
  Icon,
  StatTile,
  DataTable,
  ProgressBar,
  Field,
  Input,
  Select,
  Textarea,
  Checkbox
} = window.NetZeroCarbonDesignSystem_f3e7a8;
const f4 = (n, d = 2) => Number(n).toLocaleString(undefined, {
  minimumFractionDigits: d,
  maximumFractionDigits: d
});
function MockNote({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3)",
      alignItems: "flex-start",
      padding: "var(--space-4) var(--space-5)",
      background: "var(--status-warning-soft)",
      border: "1px dashed #E0BE7A",
      borderRadius: "var(--radius-md)",
      fontSize: "var(--text-xs)",
      lineHeight: "var(--leading-relaxed)",
      color: "#8A5B10"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "none",
      marginTop: "1px"
    }
  }, "\uD83D\uDEA7"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "\u0E22\u0E31\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07 (placeholder)"), " \u2014 ", children));
}

// ===== AD-10 · ตรวจและอนุมัติใบสมัคร =====
function ApplicationsScreen() {
  const apps = [{
    id: "AP-0312",
    code: "CPA1021",
    name: "สมพงษ์ ดีใจ",
    tambon: "หนองสะเดา",
    plots: 1,
    rai: 12.6,
    hold: "เจ้าของ",
    docs: 2,
    need: 3,
    age: "5 วัน",
    st: "เอกสารไม่ครบ",
    tone: "danger"
  }, {
    id: "AP-0313",
    code: "CPA1022",
    name: "มาลี ศรีทอง",
    tambon: "หนองสะเดา",
    plots: 2,
    rai: 8.4,
    hold: "เจ้าของร่วม",
    docs: 4,
    need: 4,
    age: "2 วัน",
    st: "พร้อมอนุมัติ",
    tone: "success"
  }, {
    id: "AP-0314",
    code: "CPA1023",
    name: "ประสิทธิ์ นากลาง",
    tambon: "หาดอาษา",
    plots: 1,
    rai: 5.1,
    hold: "ผู้เช่า",
    docs: 5,
    need: 6,
    age: "3 วัน",
    st: "รอสัญญาเช่า",
    tone: "warning"
  }, {
    id: "AP-0315",
    code: "CPA1024",
    name: "จำรัส เทียนทอง",
    tambon: "หาดอาษา",
    plots: 3,
    rai: 19.8,
    hold: "ผู้รับมอบอำนาจ",
    docs: 6,
    need: 6,
    age: "1 วัน",
    st: "พร้อมอนุมัติ",
    tone: "success"
  }];
  const [sel, setSel] = React.useState(apps[0]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(PageTitle, {
    eyebrow: "AD-10 \xB7 \u0E43\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E23\u0E2D\u0E15\u0E23\u0E27\u0E08",
    title: "\u0E15\u0E23\u0E27\u0E08\u0E41\u0E25\u0E30\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E43\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E40\u0E02\u0E49\u0E32\u0E23\u0E48\u0E27\u0E21\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23",
    sub: "\u0E0A\u0E38\u0E14\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E17\u0E35\u0E48\u0E1A\u0E31\u0E07\u0E04\u0E31\u0E1A\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E15\u0E32\u0E21\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E01\u0E32\u0E23\u0E16\u0E37\u0E2D\u0E04\u0E23\u0E2D\u0E07 (R-09) \u2014 \u0E40\u0E08\u0E49\u0E32\u0E02\u0E2D\u0E07 \xB7 \u0E40\u0E08\u0E49\u0E32\u0E02\u0E2D\u0E07\u0E23\u0E48\u0E27\u0E21 \xB7 \u0E1C\u0E39\u0E49\u0E40\u0E0A\u0E48\u0E32 \xB7 \u0E1C\u0E39\u0E49\u0E23\u0E31\u0E1A\u0E21\u0E2D\u0E1A\u0E2D\u0E33\u0E19\u0E32\u0E08",
    actions: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "upload",
        size: 15
      })
    }, "\u0E19\u0E33\u0E40\u0E02\u0E49\u0E32\u0E40\u0E1B\u0E47\u0E19\u0E0A\u0E38\u0E14")
  }), /*#__PURE__*/React.createElement(MockNote, null, "\u0E2B\u0E19\u0E49\u0E32\u0E19\u0E35\u0E49\u0E43\u0E0A\u0E49\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07 4 \u0E43\u0E1A \u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E15\u0E48\u0E2D\u0E01\u0E31\u0E1A\u0E04\u0E34\u0E27\u0E43\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E08\u0E23\u0E34\u0E07 \u0E41\u0E25\u0E30\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E15\u0E31\u0E27\u0E2D\u0E48\u0E32\u0E19\u0E40\u0E25\u0E02\u0E42\u0E09\u0E19\u0E14\u0E08\u0E32\u0E01\u0E20\u0E32\u0E1E\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E01\u0E31\u0E1A R-07 \u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(0,1fr) 400px",
      gap: "var(--space-6)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(Section, {
    title: "\u0E43\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23",
    pad: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    onRowClick: setSel,
    columns: [{
      key: "id",
      label: "เลขที่ใบสมัคร"
    }, {
      key: "code",
      label: "CPA code (จอง)"
    }, {
      key: "name",
      label: "ชื่อ - นามสกุล"
    }, {
      key: "tambon",
      label: "ตำบล"
    }, {
      key: "hold",
      label: "สถานะการถือครอง",
      render: r => /*#__PURE__*/React.createElement(Tag, {
        tone: "neutral"
      }, r.hold)
    }, {
      key: "rai",
      label: "ไร่",
      align: "right",
      render: r => f4(r.rai, 1)
    }, {
      key: "docs",
      label: "เอกสาร",
      align: "right",
      render: r => r.docs + "/" + r.need
    }, {
      key: "age",
      label: "ค้าง",
      align: "right"
    }, {
      key: "st",
      label: "สถานะ",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        tone: r.tone
      }, r.st)
    }],
    rows: apps
  })), /*#__PURE__*/React.createElement(Section, {
    title: sel.id,
    sub: sel.name + " · " + sel.hold,
    actions: /*#__PURE__*/React.createElement(Badge, {
      tone: sel.tone
    }, sel.st)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      overflow: "hidden"
    }
  }, [["เบอร์ที่จับคู่ทะเบียน", "08x-xxx-5678 ✓"], ["เลขบัตรประชาชน", "•••••••••5678"], ["ที่อยู่", "ต." + sel.tambon + " อ.สามชุก"], ["แปลงในใบสมัคร", sel.plots + " แปลง · " + f4(sel.rai, 1) + " ไร่"], ["ความยินยอม CS-01 ถึง CS-04", "ครบ 4 ข้อ · v1.2"]].map(([k, v], i, arr) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: "var(--space-4)",
      padding: "9px 12px",
      borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--grey-100)",
      fontSize: "var(--text-xs)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--weight-semibold)",
      textAlign: "right"
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "8px"
    }
  }, ["DOC-01 โฉนด", "DOC-03 บัตร ปชช.", "DOC-07 สมุดบัญชี", "DOC-06 มอบอำนาจ", "DOC-02 สัญญาเช่า", "DOC-05 กรณีจำนอง"].slice(0, sel.need).map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: d,
    style: {
      display: "flex",
      gap: "8px",
      alignItems: "center",
      padding: "8px 10px",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-sm)",
      background: i < sel.docs ? "var(--teal-50)" : "var(--white)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "24px",
      height: "30px",
      borderRadius: "3px",
      flex: "none",
      background: i < sel.docs ? "linear-gradient(160deg,#E7FCF7,#8FF3DE)" : "var(--grey-100)",
      display: "grid",
      placeItems: "center",
      fontSize: "11px",
      color: i < sel.docs ? "var(--teal-700)" : "var(--grey-400)"
    }
  }, i < sel.docs ? "✓" : "—"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "11px",
      fontWeight: "var(--weight-semibold)",
      color: i < sel.docs ? "var(--teal-800)" : "var(--text-subtle)"
    }
  }, d)))), /*#__PURE__*/React.createElement(Field, {
    label: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E17\u0E35\u0E48\u0E2A\u0E48\u0E07\u0E16\u0E36\u0E07\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23 (OB-11)",
    hint: sel.docs < sel.need ? "กรณีขอข้อมูลเพิ่ม" : "กรณีผ่าน — ระบบจะแนบรหัสเกษตรกรให้เอง"
  }, /*#__PURE__*/React.createElement(Textarea, {
    rows: 2,
    defaultValue: sel.docs < sel.need ? "เอกสารยังไม่ครบครับ — ขอสำเนาหน้าสมุดบัญชีเพิ่มอีก 1 ฉบับ ช่วยแก้ไขและส่งใหม่นะครับ" : "บัญชีของคุณเปิดใช้งานแล้วครับ 🎉"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "8px"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    fullWidth: true
  }, "\u0E02\u0E2D\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E40\u0E1E\u0E34\u0E48\u0E21"), /*#__PURE__*/React.createElement(Button, {
    fullWidth: true,
    disabled: sel.docs < sel.need,
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 16
    })
  }, "\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E41\u0E25\u0E30\u0E40\u0E1B\u0E34\u0E14\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "var(--text-subtle)",
      lineHeight: "var(--leading-relaxed)"
    }
  }, "\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E41\u0E25\u0E49\u0E27\u0E23\u0E30\u0E1A\u0E1A\u0E23\u0E31\u0E19 CPA code \u0E41\u0E25\u0E30\u0E23\u0E2B\u0E31\u0E2A\u0E41\u0E1B\u0E25\u0E07\u0E22\u0E48\u0E2D\u0E22\u0E43\u0E2B\u0E49\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34 (SY-07) \u0E41\u0E25\u0E49\u0E27\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E08\u0E32\u0E01 ", /*#__PURE__*/React.createElement("code", null, "pending_review"), " \u0E40\u0E1B\u0E47\u0E19 ", /*#__PURE__*/React.createElement("code", null, "active"))))));
}

// ===== AD-13 / LF-07 · นำเข้าใบสมัครเป็นชุด =====
function ImportScreen() {
  const [stage, setStage] = React.useState("pick");
  const rows = [{
    r: 2,
    code: "CPA1031",
    name: "บุญส่ง แก้วใส",
    deed: "8841",
    rai: "6.20",
    rice: "หอมปทุม",
    st: "ผ่าน",
    tone: "success",
    why: "—"
  }, {
    r: 3,
    code: "CPA1032",
    name: "เพ็ญศรี ทองดี",
    deed: "8842",
    rai: "3.10",
    rice: "กข85",
    st: "ผ่าน",
    tone: "success",
    why: "—"
  }, {
    r: 4,
    code: "—",
    name: "สมหมาย ใจงาม",
    deed: "8843",
    rai: "0",
    rice: "หอมปทุม",
    st: "ติดปัญหา",
    tone: "danger",
    why: "เนื้อที่แปลงเป็น 0 — ต้องมากกว่า 0 ไร่"
  }, {
    r: 5,
    code: "—",
    name: "วิไล นาคอินทร์",
    deed: "7218",
    rai: "2.40",
    rice: "หอมปทุม",
    st: "ติดปัญหา",
    tone: "danger",
    why: "เลขโฉนด 7218 มีในระบบแล้ว (CPA1001) — ต้องระบุว่าเป็นแปลงใหม่หรือแก้ของเดิม"
  }, {
    r: 6,
    code: "CPA1033",
    name: "ธนา พูลสุข",
    deed: "8845",
    rai: "11.75",
    rice: "กข43",
    st: "เตือน",
    tone: "warning",
    why: "ไม่มีเบอร์โทร — จับคู่ทะเบียนอัตโนมัติไม่ได้ ต้องให้ผู้ประสานงานยืนยันตัวตน"
  }];
  const ok = rows.filter(r => r.st !== "ติดปัญหา").length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(PageTitle, {
    eyebrow: "AD-13 \xB7 LF-07",
    title: "\u0E19\u0E33\u0E40\u0E02\u0E49\u0E32\u0E43\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E40\u0E1B\u0E47\u0E19\u0E0A\u0E38\u0E14\u0E08\u0E32\u0E01\u0E44\u0E1F\u0E25\u0E4C",
    sub: "\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14 .xlsx \u0E2B\u0E23\u0E37\u0E2D .csv \u0E15\u0E32\u0E21\u0E41\u0E21\u0E48\u0E41\u0E1A\u0E1A 21 \u0E04\u0E2D\u0E25\u0E31\u0E21\u0E19\u0E4C \xB7 \u0E15\u0E23\u0E27\u0E08\u0E23\u0E32\u0E22\u0E41\u0E16\u0E27\u0E01\u0E48\u0E2D\u0E19\u0E19\u0E33\u0E40\u0E02\u0E49\u0E32\u0E08\u0E23\u0E34\u0E07 (dry-run)",
    actions: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "download",
        size: 15
      })
    }, "\u0E14\u0E32\u0E27\u0E19\u0E4C\u0E42\u0E2B\u0E25\u0E14\u0E41\u0E21\u0E48\u0E41\u0E1A\u0E1A")
  }), /*#__PURE__*/React.createElement(MockNote, null, "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E15\u0E48\u0E2D\u0E01\u0E31\u0E1A API \u0E08\u0E23\u0E34\u0E07 (", /*#__PURE__*/React.createElement("code", null, "POST /api/farmer/import"), " \u0E41\u0E25\u0E30 ", /*#__PURE__*/React.createElement("code", null, "/commit"), ") \u0E1C\u0E25\u0E15\u0E23\u0E27\u0E08\u0E14\u0E49\u0E32\u0E19\u0E25\u0E48\u0E32\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C\u0E17\u0E35\u0E48\u0E2B\u0E19\u0E49\u0E32\u0E19\u0E35\u0E49\u0E15\u0E49\u0E2D\u0E07\u0E41\u0E2A\u0E14\u0E07"), stage === "pick" ? /*#__PURE__*/React.createElement(Section, {
    title: "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E44\u0E1F\u0E25\u0E4C"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: "2px dashed var(--border-default)",
      borderRadius: "var(--radius-lg)",
      padding: "var(--space-16)",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "56px",
      height: "56px",
      borderRadius: "var(--radius-circle)",
      background: "var(--surface-accent-soft)",
      color: "var(--teal-700)",
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "upload-cloud",
    size: 26
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-md)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)"
    }
  }, "\u0E25\u0E32\u0E01\u0E44\u0E1F\u0E25\u0E4C\u0E21\u0E32\u0E27\u0E32\u0E07 \u0E2B\u0E23\u0E37\u0E2D\u0E01\u0E14\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E44\u0E1F\u0E25\u0E4C"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-subtle)",
      marginTop: "4px"
    }
  }, ".xlsx \u0E2B\u0E23\u0E37\u0E2D .csv \xB7 \u0E44\u0E21\u0E48\u0E40\u0E01\u0E34\u0E19 5,000 \u0E41\u0E16\u0E27\u0E15\u0E48\u0E2D\u0E04\u0E23\u0E31\u0E49\u0E07 \xB7 \u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E2B\u0E31\u0E27\u0E04\u0E2D\u0E25\u0E31\u0E21\u0E19\u0E4C\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E41\u0E21\u0E48\u0E41\u0E1A\u0E1A")), /*#__PURE__*/React.createElement(Button, {
    onClick: () => setStage("review")
  }, "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E44\u0E1F\u0E25\u0E4C\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07 (5 \u0E41\u0E16\u0E27)"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement(StatTile, {
    label: "\u0E41\u0E16\u0E27\u0E43\u0E19\u0E44\u0E1F\u0E25\u0E4C",
    value: "5",
    unit: "\u0E41\u0E16\u0E27",
    note: "farmers_import_2569-08.xlsx \xB7 21 \u0E04\u0E2D\u0E25\u0E31\u0E21\u0E19\u0E4C\u0E04\u0E23\u0E1A"
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "\u0E1C\u0E48\u0E32\u0E19\u0E01\u0E32\u0E23\u0E15\u0E23\u0E27\u0E08",
    value: "2",
    unit: "\u0E41\u0E16\u0E27",
    note: "\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E19\u0E33\u0E40\u0E02\u0E49\u0E32\u0E40\u0E1B\u0E47\u0E19 pending_review"
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "\u0E40\u0E15\u0E37\u0E2D\u0E19",
    value: "1",
    unit: "\u0E41\u0E16\u0E27",
    note: "\u0E19\u0E33\u0E40\u0E02\u0E49\u0E32\u0E44\u0E14\u0E49 \u0E41\u0E15\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E2B\u0E49\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E2A\u0E32\u0E19\u0E07\u0E32\u0E19\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E15\u0E31\u0E27\u0E15\u0E19"
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "\u0E15\u0E34\u0E14\u0E1B\u0E31\u0E0D\u0E2B\u0E32",
    value: "2",
    unit: "\u0E41\u0E16\u0E27",
    note: "\u0E19\u0E33\u0E40\u0E02\u0E49\u0E32\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E08\u0E19\u0E41\u0E01\u0E49\u0E44\u0E1F\u0E25\u0E4C\u0E15\u0E49\u0E19\u0E17\u0E32\u0E07"
  })), /*#__PURE__*/React.createElement(Section, {
    title: "\u0E1C\u0E25\u0E15\u0E23\u0E27\u0E08\u0E23\u0E32\u0E22\u0E41\u0E16\u0E27 (dry-run)",
    sub: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E01\u0E32\u0E23\u0E40\u0E02\u0E35\u0E22\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E25\u0E07\u0E23\u0E30\u0E1A\u0E1A",
    pad: false,
    actions: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      onClick: () => setStage("pick")
    }, "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E44\u0E1F\u0E25\u0E4C\u0E43\u0E2B\u0E21\u0E48")
  }, /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    columns: [{
      key: "r",
      label: "แถว",
      align: "right"
    }, {
      key: "code",
      label: "CPA code ที่จะรัน",
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)",
          fontSize: "11.5px"
        }
      }, r.code)
    }, {
      key: "name",
      label: "ชื่อ - นามสกุล"
    }, {
      key: "deed",
      label: "เลขโฉนด"
    }, {
      key: "rai",
      label: "ไร่",
      align: "right"
    }, {
      key: "rice",
      label: "พันธุ์ข้าว"
    }, {
      key: "st",
      label: "ผล",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        tone: r.tone
      }, r.st)
    }, {
      key: "why",
      label: "เหตุผล"
    }],
    rows: rows
  })), /*#__PURE__*/React.createElement(Section, {
    title: "\u0E19\u0E33\u0E40\u0E02\u0E49\u0E32\u0E08\u0E23\u0E34\u0E07"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E02\u0E2D\u0E07\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E17\u0E35\u0E48\u0E19\u0E33\u0E40\u0E02\u0E49\u0E32",
    hint: "\u0E41\u0E19\u0E30\u0E19\u0E33\u0E43\u0E2B\u0E49\u0E40\u0E1B\u0E47\u0E19 pending_review \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E43\u0E2B\u0E49\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E2A\u0E32\u0E19\u0E07\u0E32\u0E19\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E15\u0E31\u0E27\u0E15\u0E19\u0E01\u0E48\u0E2D\u0E19"
  }, /*#__PURE__*/React.createElement(Select, {
    defaultValue: "pending_review"
  }, /*#__PURE__*/React.createElement("option", {
    value: "pending_review"
  }, "pending_review \u2014 \u0E23\u0E2D\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E15\u0E31\u0E27\u0E15\u0E19"), /*#__PURE__*/React.createElement("option", {
    value: "active"
  }, "active \u0E17\u0E31\u0E19\u0E17\u0E35 (\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E01\u0E32\u0E23\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E41\u0E25\u0E49\u0E27)"))), /*#__PURE__*/React.createElement(Checkbox, {
    label: "\u0E02\u0E49\u0E32\u0E21\u0E41\u0E16\u0E27\u0E17\u0E35\u0E48\u0E15\u0E34\u0E14\u0E1B\u0E31\u0E0D\u0E2B\u0E32 \u0E41\u0E25\u0E30\u0E19\u0E33\u0E40\u0E02\u0E49\u0E32\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E41\u0E16\u0E27\u0E17\u0E35\u0E48\u0E1C\u0E48\u0E32\u0E19",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "\u0E2A\u0E48\u0E07\u0E44\u0E1F\u0E25\u0E4C\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E1C\u0E25\u0E19\u0E33\u0E40\u0E02\u0E49\u0E32\u0E43\u0E2B\u0E49\u0E14\u0E32\u0E27\u0E19\u0E4C\u0E42\u0E2B\u0E25\u0E14\u0E2B\u0E25\u0E31\u0E07\u0E40\u0E2A\u0E23\u0E47\u0E08 (\u0E17\u0E31\u0E49\u0E07\u0E41\u0E16\u0E27\u0E17\u0E35\u0E48\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08\u0E41\u0E25\u0E30\u0E41\u0E16\u0E27\u0E17\u0E35\u0E48\u0E15\u0E34\u0E14\u0E1B\u0E31\u0E0D\u0E2B\u0E32\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E40\u0E2B\u0E15\u0E38\u0E1C\u0E25)",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "8px"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outline"
  }, "\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01"), /*#__PURE__*/React.createElement(Button, {
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 16
    })
  }, "\u0E19\u0E33\u0E40\u0E02\u0E49\u0E32 ", ok, " \u0E41\u0E16\u0E27"))))));
}

// ===== AD-16 · แผนที่ขอบแปลงรายโฉนด (เฟส 2) =====
function MapScreen() {
  const [sel, setSel] = React.useState(PLOTS[0].plot);
  // ขอบแปลงจำลอง — ไฟล์จริงมี WKT MULTIPOLYGON ครบทุกแปลง แต่เป็นพิกัด UTM zone 47N ต้องแปลงเป็น WGS84 ก่อน
  const shapes = PLOTS.slice(0, 10).map((p, i) => ({
    plot: p.plot,
    rai: p.rai,
    cpa: p.cpa,
    d: [[8, 14, 22, 16], [30, 10, 18, 24], [52, 18, 26, 14], [12, 44, 20, 20], [38, 40, 24, 18], [66, 36, 20, 26], [16, 70, 26, 16], [46, 66, 18, 22], [70, 68, 22, 18], [84, 20, 12, 30]][i]
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(PageTitle, {
    eyebrow: "AD-16 \xB7 \u0E40\u0E1F\u0E2A 2",
    title: "\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E02\u0E2D\u0E1A\u0E41\u0E1B\u0E25\u0E07\u0E23\u0E32\u0E22\u0E42\u0E09\u0E19\u0E14",
    sub: "\u0E43\u0E0A\u0E49\u0E15\u0E23\u0E27\u0E08\u0E27\u0E48\u0E32\u0E1E\u0E34\u0E01\u0E31\u0E14\u0E02\u0E2D\u0E07\u0E20\u0E32\u0E1E\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E15\u0E01\u0E43\u0E19\u0E02\u0E2D\u0E1A\u0E40\u0E02\u0E15\u0E41\u0E1B\u0E25\u0E07\u0E08\u0E23\u0E34\u0E07\u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48 \xB7 \u0E02\u0E2D\u0E1A\u0E41\u0E1B\u0E25\u0E07\u0E21\u0E32\u0E08\u0E32\u0E01\u0E04\u0E2D\u0E25\u0E31\u0E21\u0E19\u0E4C WKT \u0E43\u0E19\u0E44\u0E1F\u0E25\u0E4C\u0E04\u0E33\u0E19\u0E27\u0E13",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "download",
        size: 15
      })
    }, "\u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01 GeoJSON"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline"
    }, "\u0E0B\u0E49\u0E2D\u0E19\u0E20\u0E32\u0E1E\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21"))
  }), /*#__PURE__*/React.createElement(MockNote, null, "\u0E41\u0E1C\u0E19\u0E1C\u0E31\u0E07\u0E14\u0E49\u0E32\u0E19\u0E25\u0E48\u0E32\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E20\u0E32\u0E1E\u0E08\u0E33\u0E25\u0E2D\u0E07 \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E08\u0E23\u0E34\u0E07 \u2014 \u0E44\u0E1F\u0E25\u0E4C ", /*#__PURE__*/React.createElement("code", null, "NZC - \u0E01\u0E32\u0E23\u0E04\u0E33\u0E19\u0E27\u0E13 AWD.xlsx"), " \u0E21\u0E35 ", /*#__PURE__*/React.createElement("code", null, "WKT MULTIPOLYGON"), " \u0E02\u0E2D\u0E07\u0E17\u0E38\u0E01\u0E41\u0E1B\u0E25\u0E07\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E43\u0E0A\u0E49\u0E41\u0E25\u0E49\u0E27 \u0E41\u0E15\u0E48\u0E1E\u0E34\u0E01\u0E31\u0E14\u0E40\u0E1B\u0E47\u0E19 UTM zone 47N \u0E15\u0E49\u0E2D\u0E07\u0E41\u0E1B\u0E25\u0E07\u0E40\u0E1B\u0E47\u0E19 WGS84 \u0E01\u0E48\u0E2D\u0E19\u0E27\u0E32\u0E07\u0E1A\u0E19\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E08\u0E23\u0E34\u0E07 \u0E41\u0E25\u0E30\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E0A\u0E31\u0E49\u0E19\u0E20\u0E32\u0E1E\u0E16\u0E48\u0E32\u0E22\u0E14\u0E32\u0E27\u0E40\u0E17\u0E35\u0E22\u0E21/\u0E42\u0E14\u0E23\u0E19\u0E43\u0E19\u0E0A\u0E38\u0E14\u0E17\u0E35\u0E48\u0E43\u0E2B\u0E49\u0E21\u0E32"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(0,1fr) 360px",
      gap: "var(--space-6)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(Section, {
    title: "\u0E15.\u0E2B\u0E19\u0E2D\u0E07\u0E2A\u0E30\u0E40\u0E14\u0E32 \u0E2D.\u0E2A\u0E32\u0E21\u0E0A\u0E38\u0E01 \u0E08.\u0E2A\u0E38\u0E1E\u0E23\u0E23\u0E13\u0E1A\u0E38\u0E23\u0E35",
    sub: "10 \u0E41\u0E1B\u0E25\u0E07\u0E22\u0E48\u0E2D\u0E22\u0E17\u0E35\u0E48\u0E41\u0E2A\u0E14\u0E07\u0E2D\u0E22\u0E39\u0E48 \xB7 \u0E01\u0E14\u0E17\u0E35\u0E48\u0E23\u0E39\u0E1B\u0E41\u0E1B\u0E25\u0E07\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E25\u0E37\u0E2D\u0E01",
    pad: false
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      aspectRatio: "16 / 10",
      background: "linear-gradient(160deg,#E9F0E2,#D6E4C8 55%,#C3D6B2)",
      overflow: "hidden"
    }
  }, [18, 38, 58, 78].map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      top: t + "%",
      height: "3px",
      background: "rgba(120,140,110,.35)"
    }
  })), [26, 62].map(l => /*#__PURE__*/React.createElement("span", {
    key: l,
    style: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: l + "%",
      width: "4px",
      background: "rgba(110,150,190,.45)"
    }
  })), shapes.map(s => {
    const on = s.plot === sel;
    return /*#__PURE__*/React.createElement("button", {
      key: s.plot,
      onClick: () => setSel(s.plot),
      title: s.plot,
      style: {
        position: "absolute",
        left: s.d[0] + "%",
        top: s.d[1] + "%",
        width: s.d[2] + "%",
        height: s.d[3] + "%",
        border: "2px solid " + (on ? "var(--teal-600)" : "rgba(6,30,92,.5)"),
        background: on ? "rgba(2,142,145,.34)" : "rgba(6,30,92,.13)",
        borderRadius: "3px",
        cursor: "pointer",
        padding: 0,
        display: "grid",
        placeItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "9px",
        fontWeight: 700,
        color: on ? "#fff" : "var(--navy-900)",
        background: on ? "var(--teal-700)" : "rgba(255,255,255,.7)",
        padding: "1px 4px",
        borderRadius: "3px"
      }
    }, s.plot.split("/")[1]), on ? /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        left: "52%",
        top: "48%",
        width: "9px",
        height: "9px",
        borderRadius: "50%",
        background: "var(--status-danger)",
        boxShadow: "0 0 0 3px rgba(255,255,255,.8)"
      }
    }) : null);
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "12px",
      bottom: "12px",
      background: "rgba(255,255,255,.9)",
      borderRadius: "var(--radius-sm)",
      padding: "8px 11px",
      fontSize: "11px",
      display: "flex",
      flexDirection: "column",
      gap: "5px"
    }
  }, [["rgba(6,30,92,.5)", "ขอบแปลงจาก WKT"], ["var(--teal-600)", "แปลงที่เลือก"], ["var(--status-danger)", "พิกัดของภาพหลักฐาน"]].map(([c, l]) => /*#__PURE__*/React.createElement("span", {
    key: l,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "10px",
      height: "10px",
      borderRadius: "2px",
      background: c
    }
  }), l))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: "12px",
      bottom: "12px",
      background: "rgba(255,255,255,.9)",
      borderRadius: "var(--radius-sm)",
      padding: "6px 10px",
      fontFamily: "var(--font-mono)",
      fontSize: "10px",
      color: "var(--text-muted)"
    }
  }, "UTM 47N \u2192 \u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E41\u0E1B\u0E25\u0E07\u0E40\u0E1B\u0E47\u0E19 WGS84"))), /*#__PURE__*/React.createElement(Section, {
    title: sel,
    sub: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E1B\u0E25\u0E07\u0E17\u0E35\u0E48\u0E40\u0E25\u0E37\u0E2D\u0E01"
  }, (() => {
    const p = PLOTS.find(x => x.plot === sel);
    const c = computePlotSeason(p);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        fontSize: "var(--text-xs)"
      }
    }, [["CPA code", p.cpa], ["เลขโฉนด", p.deed], ["เนื้อที่", f4(p.rai, 2) + " ไร่"], ["พันธุ์ข้าว", p.rice], ["ภาพหลักฐาน", p.photosApproved + "/4 รอบ"], ["SF_w ที่ใช้จริง", c.sfWpj.v.toFixed(2) + (c.sfWpj.fallback ? " (fallback)" : "")], ["ER ฤดูนี้", f4(c.er, 3) + " tCO₂eq"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        display: "flex",
        justifyContent: "space-between",
        gap: "var(--space-4)",
        paddingBottom: "7px",
        borderBottom: "1px dashed var(--grey-200)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)"
      }
    }, k), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: "var(--weight-semibold)",
        textAlign: "right"
      }
    }, v))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "9.5px",
        color: "var(--text-subtle)",
        background: "var(--grey-50)",
        padding: "8px 9px",
        borderRadius: "var(--radius-sm)",
        wordBreak: "break-all",
        lineHeight: 1.5
      }
    }, "MULTIPOLYGON (((606807.999 1636052.415, 606691.291 1635846.094, \u2026)))"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      fullWidth: true,
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "image",
        size: 14
      })
    }, "\u0E14\u0E39\u0E20\u0E32\u0E1E\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E02\u0E2D\u0E07\u0E41\u0E1B\u0E25\u0E07\u0E19\u0E35\u0E49"));
  })())));
}

// ===== AD-12 · โหมดเจ้าหน้าที่ตอบแชต =====
function ChatModeScreen() {
  const threads = [{
    code: "CPA1001",
    last: "ถ่ายรูปแล้วแต่ส่งไม่ได้ครับ สัญญาณไม่ดี",
    at: "09:12",
    unread: 2,
    on: true
  }, {
    code: "CPA1006",
    last: "ท่อวัดระดับน้ำหักครับ ขอใหม่ได้ไหม",
    at: "08:40",
    unread: 1,
    on: false
  }, {
    code: "CPA1012",
    last: "ยังไม่ได้หว่านครับ ฝนไม่มา",
    at: "เมื่อวาน",
    unread: 0,
    on: false
  }];
  const [sel, setSel] = React.useState(threads[0]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(PageTitle, {
    eyebrow: "AD-12 \xB7 \u0E42\u0E2B\u0E21\u0E14\u0E40\u0E08\u0E49\u0E32\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48\u0E15\u0E2D\u0E1A\u0E41\u0E0A\u0E15",
    title: "\u0E23\u0E31\u0E1A\u0E0A\u0E48\u0E27\u0E07\u0E04\u0E38\u0E22\u0E01\u0E31\u0E1A\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23\u0E08\u0E32\u0E01\u0E1A\u0E2D\u0E15",
    sub: "\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E40\u0E08\u0E49\u0E32\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48\u0E40\u0E02\u0E49\u0E32\u0E23\u0E31\u0E1A \u0E1A\u0E2D\u0E15\u0E08\u0E30\u0E2B\u0E22\u0E38\u0E14\u0E15\u0E2D\u0E1A\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34\u0E08\u0E19\u0E01\u0E14\u0E04\u0E37\u0E19\u0E43\u0E2B\u0E49\u0E1A\u0E2D\u0E15 \xB7 \u0E40\u0E27\u0E25\u0E32\u0E17\u0E33\u0E01\u0E32\u0E23 \u0E08-\u0E28 08:30-17:00"
  }), /*#__PURE__*/React.createElement(MockNote, null, "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E15\u0E48\u0E2D\u0E01\u0E31\u0E1A LINE Messaging API \u2014 \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E43\u0E19\u0E2B\u0E19\u0E49\u0E32\u0E19\u0E35\u0E49\u0E40\u0E1B\u0E47\u0E19\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07 \u0E41\u0E25\u0E30\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E23\u0E30\u0E1A\u0E1A\u0E21\u0E2D\u0E1A\u0E2B\u0E21\u0E32\u0E22\u0E07\u0E32\u0E19 (assign) \u0E2B\u0E23\u0E37\u0E2D\u0E41\u0E21\u0E48\u0E41\u0E1A\u0E1A\u0E04\u0E33\u0E15\u0E2D\u0E1A"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "300px minmax(0,1fr)",
      gap: "var(--space-6)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(Section, {
    title: "\u0E2B\u0E49\u0E2D\u0E07\u0E41\u0E0A\u0E15",
    sub: "\u0E23\u0E30\u0E1A\u0E38\u0E14\u0E49\u0E27\u0E22 CPA code",
    pad: false
  }, /*#__PURE__*/React.createElement("div", null, threads.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.code,
    onClick: () => setSel(t),
    style: {
      width: "100%",
      textAlign: "left",
      border: "none",
      borderBottom: "1px solid var(--grey-100)",
      background: sel.code === t.code ? "var(--navy-50)" : "#fff",
      padding: "12px 14px",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      display: "flex",
      gap: "10px",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "34px",
      height: "34px",
      borderRadius: "var(--radius-circle)",
      background: "var(--teal-600)",
      color: "#fff",
      display: "grid",
      placeItems: "center",
      fontSize: "10px",
      fontWeight: 700,
      flex: "none"
    }
  }, t.code.slice(-2)), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: "6px"
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "12px"
    }
  }, t.code), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "10px",
      color: "var(--text-subtle)"
    }
  }, t.at)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "11.5px",
      color: "var(--text-muted)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, t.last), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      gap: "5px",
      marginTop: "4px"
    }
  }, t.unread ? /*#__PURE__*/React.createElement(Badge, {
    tone: "danger"
  }, t.unread, " \u0E43\u0E2B\u0E21\u0E48") : null, t.on ? /*#__PURE__*/React.createElement(Badge, {
    tone: "info"
  }, "\u0E40\u0E08\u0E49\u0E32\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48\u0E23\u0E31\u0E1A\u0E41\u0E25\u0E49\u0E27") : /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    dot: false
  }, "\u0E1A\u0E2D\u0E15\u0E15\u0E2D\u0E1A\u0E2D\u0E22\u0E39\u0E48"))))))), /*#__PURE__*/React.createElement(Section, {
    title: sel.code,
    sub: sel.on ? "โหมดเจ้าหน้าที่ — บอตหยุดตอบอัตโนมัติ" : "บอตตอบอยู่ — กดรับเพื่อคุยเอง",
    actions: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: sel.on ? "outline" : "primary"
    }, sel.on ? "คืนให้บอต" : "รับเรื่องนี้")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      minHeight: "280px"
    }
  }, [["farmer", "ถ่ายรูปแล้วแต่ส่งไม่ได้ครับ สัญญาณไม่ดี", "09:12"], ["bot", "ระบบมีโหมดสัญญาณไม่ดีครับ (SY-06) ภาพจะเก็บไว้ในเครื่องแล้วส่งอัตโนมัติเมื่อมีสัญญาณ", "09:12"], ["farmer", "กดที่ไหนครับ", "09:13"], ["staff", "สวัสดีครับ เจ้าหน้าที่รับเรื่องแล้วครับ — กดที่เมนู 'บันทึกงานในแปลง' แล้วดูแถบสีเหลืองด้านบน จะมีปุ่ม 'ส่งภาพที่ค้างอยู่' ครับ", "09:15"]].map(([who, text, at], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      justifyContent: who === "farmer" ? "flex-start" : "flex-end"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "68%",
      padding: "10px 13px",
      borderRadius: "14px",
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-normal)",
      background: who === "farmer" ? "var(--grey-100)" : who === "bot" ? "var(--navy-50)" : "var(--teal-600)",
      color: who === "staff" ? "#fff" : "var(--text-body)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "10px",
      fontWeight: "var(--weight-semibold)",
      opacity: .72,
      marginBottom: "3px"
    }
  }, who === "farmer" ? "เกษตรกร" : who === "bot" ? "บอต (ตอบอัตโนมัติ)" : "เจ้าหน้าที่", " \xB7 ", at), text)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "8px",
      marginTop: "var(--space-4)",
      paddingTop: "var(--space-4)",
      borderTop: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "\u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E16\u0E36\u0E07\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23\u2026"
  }), /*#__PURE__*/React.createElement(Button, {
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "send",
      size: 15
    })
  }, "\u0E2A\u0E48\u0E07")))));
}
Object.assign(window, {
  ApplicationsScreen,
  ImportScreen,
  MapScreen,
  ChatModeScreen,
  MockNote
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin_console/AdminScreens3.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin_console/calc.jsx
try { (() => {
// เครื่องคำนวณเครดิต AWD — สมการตาม T-VER-P-METH-13-08 (แนวทางการประเมินที่ 3)
// ถอดจาก NZC_Phase2_Calculation_AWD.xlsx (ชีต 1_สมการ · 2_พารามิเตอร์คงที่ · 3_พารามิเตอร์ตามพฤติกรรม)
// ค่าทุกตัวสอบกลับกับ NZC - การคำนวณ AWD.xlsx แล้ว (ชีต Sheet32 และ 3.7 สรุปGHG)

// ---------- กลุ่ม A · พารามิเตอร์คงที่ ----------
const A = {
  EF_BL_c: 0.1952,
  // กก.CH4/ไร่/วัน — IPCC 2019 V4 Ch5 Table 5.11 (1.22 kg/ha/d ÷ 6.25)
  CF: 0.89,
  // ตัวปรับอนุรักษ์นิยม — คูณเฉพาะมีเทนของกรณีฐาน (E-03)
  U_d: 0.15,
  // ส่วนหักความไม่แน่นอน — แนวทางที่ 3 บังคับ 15% เสมอ (E-01)
  GWP_CH4: 28,
  GWP_N2O: 265,
  EF_Limestone: 0.12,
  // ตัน C/ตันหินปูน
  EF_Dolomite: 0.13,
  // ตัน C/ตันโดโลไมต์
  EF_Urea: 0.2,
  // ตัน C/ตันยูเรีย
  Frac_GASF: 0.11,
  Frac_GASM: 0.21,
  Frac_LEACH: 0.24,
  EF_ATD: 0.01,
  EF_LEACH: 0.011,
  EF_CH4_burn: 2.7 // กรัม CH4/กก.แห้ง
};

// ---------- กลุ่ม B · ตารางค้นค่าตามพฤติกรรม ----------
const SF_P = {
  "WP-1": {
    v: 2.41,
    label: "ขังน้ำก่อนปลูก > 30 วัน"
  },
  "WP-2": {
    v: 1.00,
    label: "ไม่ขังน้ำ < 180 วัน หรือขังน้ำสั้น ๆ < 30 วัน"
  },
  "WP-3": {
    v: 0.68,
    label: "ไม่มีการขังน้ำก่อนปลูก > 180 วัน"
  },
  "WP-4": {
    v: 0.58,
    label: "ไม่มีการขังน้ำก่อนปลูก > 365 วัน"
  }
};
// SF_w: ค่า 0.55 ใช้ได้ต่อเมื่อหลักฐานภาพระดับน้ำในท่อครบ — ถ้าไม่ครบ ถอยเป็น 0.71 พร้อม flag
const SF_W = {
  "WW-1": {
    v: 1.00,
    n2o: 0.003,
    label: "ขังน้ำต่อเนื่องตลอดฤดู",
    photos: 0
  },
  "WW-2": {
    v: 0.71,
    n2o: 0.005,
    label: "ระบายน้ำ / ปล่อยแห้ง 1 ครั้ง",
    photos: 2
  },
  "WW-3": {
    v: 0.55,
    n2o: 0.005,
    label: "ปล่อยแห้งหลายครั้ง / เปียกสลับแห้ง (AWD)",
    photos: 4,
    fallback: "WW-2"
  }
};
const CFOA = {
  "OM-1": {
    v: 1.00,
    label: "ฟางไถกลบก่อนปลูก < 30 วัน"
  },
  "OM-2": {
    v: 0.29,
    label: "ฟางไถกลบก่อนปลูก > 30 วัน"
  },
  "OM-3": {
    v: 0.45,
    label: "ปุ๋ยหมัก / วัสดุอินทรีย์อื่น"
  },
  "OM-4": {
    v: 0.14,
    label: "ปุ๋ยคอก"
  }
};

// ---------- ปฏิทินภาพหลักฐาน: 4 ภาพต่อครอป · เปียก 2 · แห้ง 2 สลับกัน ----------
// WW-3 (AWD) ต้องมีคู่ เปียก-แห้ง ครบ 2 รอบ จึงจะใช้ SF_w = 0.55 ได้
const PHOTO_ROUNDS = [{
  code: "WET-1",
  stage: "SG-04",
  name: "รอบที่ 1 · เปียก",
  phase: "wet",
  day: 28,
  need: "ภาพท่อ PVC ให้เห็นน้ำเต็มระดับผิวดิน"
}, {
  code: "DRY-1",
  stage: "SG-05",
  name: "รอบที่ 1 · แห้ง",
  phase: "dry",
  day: 42,
  need: "ภาพท่อ PVC ให้เห็นระดับน้ำต่ำกว่าผิวดิน (อ่านค่า ซม.)"
}, {
  code: "WET-2",
  stage: "SG-07",
  name: "รอบที่ 2 · เปียก",
  phase: "wet",
  day: 61,
  need: "ภาพท่อ PVC ให้เห็นน้ำเต็มระดับผิวดินอีกครั้ง"
}, {
  code: "DRY-2",
  stage: "SG-08",
  name: "รอบที่ 2 · แห้ง",
  phase: "dry",
  day: 75,
  need: "ภาพท่อ PVC ให้เห็นระดับน้ำต่ำกว่าผิวดิน (อ่านค่า ซม.)"
}];

// ---------- E-08 · ตัวปรับจากวัสดุอินทรีย์ ----------
function sfOrganic(items) {
  // [{code, roa}] — roa เป็น กก./ไร่
  const sum = (items || []).reduce((s, it) => s + it.roa * 0.00625 * (CFOA[it.code] ? CFOA[it.code].v : 1), 0);
  return Math.pow(1 + sum, 0.59);
}

// ---------- E-07 · ค่าสัมประสิทธิ์การปล่อยมีเทนของแปลง ----------
function efCh4(sfP, sfW, sfO) {
  return A.EF_BL_c * sfP * sfW * sfO;
}

// ---------- E-06 · มีเทนจากพื้นที่นา (tCO2eq) ----------
function ch4Soil(ef, rai, days) {
  return ef * rai * days * 1e-3 * A.GWP_CH4;
}

// ---------- E-09 / E-10 · ปูนและยูเรีย (tCO2eq) ----------
function co2Lime(mLimeT, mDoloT, rai) {
  return (mLimeT * rai * A.EF_Limestone + mDoloT * rai * A.EF_Dolomite) * 44 / 12;
}
function co2Urea(mUreaT, rai) {
  return mUreaT * rai * A.EF_Urea * 44 / 12;
}

// ---------- E-11 ถึง E-16 · ไนตรัสออกไซด์ (tCO2eq) ----------
function n2oSoil(nSynthKg, nOrgKg, rai, efDirect) {
  const nSyn = nSynthKg * rai / 1000,
    nOrg = nOrgKg * rai / 1000; // ตัน N
  const direct = (nSyn + nOrg) * efDirect * 44 / 28;
  const volat = (nSyn * A.Frac_GASF + nOrg * A.Frac_GASM) * A.EF_ATD * 44 / 28;
  const leach = (nSyn + nOrg) * A.Frac_LEACH * A.EF_LEACH * 44 / 28;
  return (direct + volat + leach) * A.GWP_N2O;
}

// ---------- E-17 · เชื้อเพลิงและไฟฟ้าที่เพิ่มขึ้น (ฝั่งโครงการเท่านั้น) ----------
const FUEL = {
  "ดีเซล": {
    ncv: 36.42e-6,
    ef: 74100
  },
  "เบนซิน": {
    ncv: 34.2e-6,
    ef: 69300
  }
}; // TJ/ลิตร · kgCO2/TJ
function co2Fuel(litrePerRai, rai, type, kwhPerRai) {
  const f = FUEL[type] || FUEL["ดีเซล"];
  const fuel = litrePerRai * rai * f.ncv * f.ef / 1000; // tCO2eq
  const elec = (kwhPerRai || 0) * rai / 1000 * 0.4999; // MWh × EF กริดไทย
  return fuel + elec;
}

// ---------- E-18 · การเผามวลชีวภาพ ----------
function nonCo2Burn(mbKgPerRai, raiBurned) {
  return raiBurned > 0 ? mbKgPerRai * raiBurned * A.EF_CH4_burn / 1e6 * A.GWP_CH4 : 0;
}

// ---------- ขั้นที่ 2 · ตัดสิน SF_w จากหลักฐาน ----------
function resolveSfW(code, photosApproved) {
  const row = SF_W[code] || SF_W["WW-1"];
  if (row.fallback && photosApproved < row.photos) {
    const fb = SF_W[row.fallback];
    return {
      code: row.fallback,
      v: fb.v,
      n2o: fb.n2o,
      fallback: true,
      reason: "หลักฐานภาพระดับน้ำครบ " + photosApproved + "/" + row.photos + " ภาพ — ยังใช้ SF_w = " + row.v.toFixed(2) + " ไม่ได้"
    };
  }
  return {
    code,
    v: row.v,
    n2o: row.n2o,
    fallback: false,
    reason: "หลักฐานครบ " + photosApproved + "/" + row.photos + " ภาพ"
  };
}

// ---------- E-03 / E-05 · รวมรายฤดูรายแปลง ----------
function seasonSide(side, p, sfW) {
  const sfO = sfOrganic(p.organic);
  const ef = efCh4(SF_P[p.sfP] ? SF_P[p.sfP].v : 1, sfW.v, sfO);
  const ch4 = ch4Soil(ef, p.rai, p.days);
  const lime = co2Lime(p.limeT || 0, p.doloT || 0, p.rai);
  const urea = co2Urea(p.ureaT || 0, p.rai);
  const n2o = n2oSoil(p.nSynth || 0, p.nOrg || 0, p.rai, sfW.n2o);
  const fuel = side === "PJ" ? co2Fuel(p.fuelL || 0, p.rai, p.fuelType, p.kwh) : 0;
  const burn = p.burnRai ? nonCo2Burn(p.mb || 0, p.burnRai) : 0;
  const ch4Applied = side === "BL" ? ch4 * A.CF : ch4; // CF คูณเฉพาะมีเทนกรณีฐาน
  return {
    sfO,
    ef,
    ch4,
    ch4Applied,
    lime,
    urea,
    n2o,
    fuel,
    burn,
    total: ch4Applied + lime + urea + n2o + fuel + burn
  };
}

// ---------- E-01 · ER ของแปลง-ฤดู ----------
function computePlotSeason(plot) {
  const sfWbl = resolveSfW(plot.bl.wwCode, 99); // กรณีฐานเป็นพฤติกรรมย้อนหลัง ไม่ต้องมีภาพ
  const sfWpj = resolveSfW(plot.pj.wwCode, plot.photosApproved || 0); // ฤดูโครงการต้องมีภาพครบ 4
  const BL = seasonSide("BL", {
    ...plot,
    ...plot.bl
  }, sfWbl);
  const PJ = seasonSide("PJ", {
    ...plot,
    ...plot.pj
  }, sfWpj);
  const er = Math.max(0, (BL.total - PJ.total - 0) * (1 - A.U_d));
  return {
    BL,
    PJ,
    sfWbl,
    sfWpj,
    be: BL.total,
    pe: PJ.total,
    le: 0,
    er
  };
}

// ---------- ตัวเลขจริงของโครงการ (ชีต 3.7 สรุปGHG) ----------
// โครงการทำนาลดโลกร้อนพื้นที่สุพรรณบุรี (อ.สามชุก) · 120 วันต่อรอบ · 2 ฤดูต่อปี
const GHG_2569 = {
  rows: [{
    name: "น้ำขัง (มีเทน)",
    s1: [648.9607, 136.0118],
    s2: [247.2942, 136.0118],
    eq: "E-06 · E-07"
  }, {
    name: "สารปรับปรุงดิน (ปูน)",
    s1: [0.6497, 0.6497],
    s2: [0.6497, 0.6497],
    eq: "E-09"
  }, {
    name: "ปุ๋ยยูเรีย",
    s1: [3.0774, 3.0774],
    s2: [3.0774, 3.0774],
    eq: "E-10"
  }, {
    name: "ปุ๋ยไนโตรเจน",
    s1: [12.2560, 15.8437],
    s2: [12.2560, 15.8437],
    eq: "E-11 ถึง E-16"
  }, {
    name: "การเผาไหม้เชื้อเพลิงฟอสซิล",
    s1: [0, 13.0219],
    s2: [0, 13.0219],
    eq: "E-17"
  }, {
    name: "การเผาไหม้มวลชีวภาพ",
    s1: [0, 0],
    s2: [0, 0],
    eq: "E-18"
  }],
  be: 829.6331,
  pe: 337.2090,
  le: 0,
  er: 418.5605
};
Object.assign(window, {
  A_CONST: A,
  SF_P,
  SF_W,
  CFOA,
  PHOTO_ROUNDS,
  sfOrganic,
  efCh4,
  ch4Soil,
  resolveSfW,
  computePlotSeason,
  GHG_2569
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin_console/calc.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin_console/data.jsx
try { (() => {
// ข้อมูลจริงจาก NZC - การคำนวณ AWD.xlsx (ชีต Sheet32 · 1.ข้อมูลการทำนา_แปลงใหญ่ / _แปลงย่อย)
// ตัวระบุที่ใช้ในระบบคือ CPA code และรหัสแปลงย่อย CPA####/F## — ไม่ใช้ชื่อในทุกไฟล์ที่ส่งออกและทุกหน้าที่ลูกค้าเห็น (PDPA · CS-02)

const SPONSORS = [{
  id: "SCBX",
  name: "SCBX",
  areas: ["สุพรรณบุรี"],
  rai: 148.4,
  households: 13,
  verified: 355.8,
  estimate: 418.6
}, {
  id: "TOLLWAY",
  name: "ทางยกระดับดอนเมือง",
  areas: ["ชัยนาท"],
  rai: 62.8,
  households: 6,
  verified: 0,
  estimate: 176.3
}];
const PROVINCES = [{
  name: "สุพรรณบุรี",
  districts: 1,
  tambon: 1,
  rai: 148.4,
  households: 13,
  credits: 418.5605,
  note: "ต.หนองสะเดา อ.สามชุก — พื้นที่ขึ้นทะเบียนแล้ว"
}, {
  name: "ชัยนาท",
  districts: 1,
  tambon: 1,
  rai: 62.8,
  households: 6,
  credits: 176.3,
  note: "กลุ่มใหม่ · ยังไม่เข้ารอบทวนสอบ"
}];

// แปลงย่อยจริง — เนื้อที่ พันธุ์ข้าว และวัสดุอินทรีย์ตามไฟล์
// bl / pj: รหัสพฤติกรรม (กลุ่ม B) · ปริมาณปุ๋ยฝั่ง BL และ PJ เท่ากันโดยเจตนา
// "การเข้าร่วมโครงการไม่มีวัตถุประสงค์ให้เกษตรกรปรับลดปริมาณการใช้ปุ๋ย" — ชีต 1.ข้อมูลการทำนา_แปลงย่อย
function mkPlot(cpa, plot, deed, rai, rice, roa, nSynth, ureaKg, doloKg, fuelL, photos) {
  return {
    cpa,
    plot,
    deed,
    rai,
    rice,
    days: 120,
    photosApproved: photos,
    organicRoa: roa,
    bl: {
      wwCode: "WW-1",
      sfP: "WP-1",
      organic: roa ? [{
        code: "OM-3",
        roa
      }] : [],
      nSynth,
      ureaT: ureaKg / 1000,
      doloT: doloKg / 1000,
      limeT: 0
    },
    pj: {
      wwCode: "WW-3",
      sfP: "WP-2",
      organic: roa ? [{
        code: "OM-3",
        roa
      }] : [],
      nSynth,
      ureaT: ureaKg / 1000,
      doloT: doloKg / 1000,
      limeT: 0,
      fuelL,
      fuelType: "ดีเซล",
      kwh: 0
    }
  };
}
const PLOTS = [mkPlot("CPA1001", "CPA1001/F01", "7218", 2.4, "หอมปทุม", 2500, 25, 20, 0, 20, 4), mkPlot("CPA1001", "CPA1001/F02", "7217, 7218, 40447", 6.25, "หอมปทุม", 2500, 25, 20, 0, 20, 4), mkPlot("CPA1002", "CPA1002/F01", "7224", 4.02, "หอมปทุม", 2500, 25, 20, 0, 20, 3), mkPlot("CPA1002", "CPA1002/F02", "7224", 2.28, "หอมปทุม", 2500, 25, 20, 0, 20, 4), mkPlot("CPA1003", "CPA1003/F01", "6814", 3.16, "กข85", 0, 20, 20, 0, 25, 4), mkPlot("CPA1003", "CPA1003/F02", "6814", 0.74, "กข85", 0, 20, 20, 0, 25, 2), mkPlot("CPA1004", "CPA1004/F01", "7235", 8.63, "กข85", 0, 20, 20, 5, 25, 4), mkPlot("CPA1005", "CPA1005/F01", "43720", 2.32, "กข85", 0, 20, 20, 5, 25, 4), mkPlot("CPA1006", "CPA1006/F01", "36135, 36136", 5.72, "กข85", 0, 20, 20, 5, 25, 1), mkPlot("CPA1007", "CPA1007/F01", "20833", 3.84, "กข85", 0, 20, 20, 5, 25, 4), mkPlot("CPA1010", "CPA1010/F01", "6799", 2.47, "หอมปทุม", 0, 25, 20, 0, 20, 4), mkPlot("CPA1012", "CPA1012/F01", "36400", 4.13, "หอมปทุม", 0, 25, 20, 25, 20, 0), mkPlot("CPA1013", "CPA1013/F02", "12533", 5.09, "กข85", 0, 20, 20, 5, 25, 3)];

// ชื่อเกษตรกรตามไฟล์ — ใช้เฉพาะหน้ารายละเอียดของแอดมิน
const FARMER_NAMES = {
  CPA1001: "วิชา ทองโสภา",
  CPA1002: "วิชา ทองโสภา",
  CPA1003: "อุดมทรัพย์ เตียวเจริญสิน",
  CPA1004: "ชูเกียรติ เนียมแก้ว",
  CPA1005: "ชูเกียรติ เนียมแก้ว",
  CPA1006: "ชูเกียรติ เนียมแก้ว",
  CPA1007: "ชูเกียรติ เนียมแก้ว",
  CPA1010: "กนกอร ทองโสภา",
  CPA1012: "ไชยา ตะมะณี",
  CPA1013: "ชูศักดิ์ เนียมแก้ว"
};

// รวมรายแปลง → รายเกษตรกร (CPA code) พร้อมผลคำนวณจริง
const FARMERS = (() => {
  const by = {};
  for (const p of PLOTS) {
    const r = computePlotSeason(p);
    const k = p.cpa;
    by[k] = by[k] || {
      code: k,
      name: FARMER_NAMES[k] || "—",
      prov: "สุพรรณบุรี",
      tambon: "หนองสะเดา",
      district: "สามชุก",
      sponsor: "SCBX",
      plots: [],
      rai: 0,
      er: 0,
      be: 0,
      pe: 0,
      photos: 0,
      need: 0,
      fallback: 0
    };
    by[k].plots.push({
      ...p,
      calc: r
    });
    by[k].rai += p.rai;
    by[k].er += r.er;
    by[k].be += r.be;
    by[k].pe += r.pe;
    by[k].photos += p.photosApproved;
    by[k].need += 4;
    if (r.sfWpj.fallback) by[k].fallback++;
    by[k].rice = p.rice;
  }
  return Object.values(by).map(f => {
    f.rai = +f.rai.toFixed(2);
    f.er = +f.er.toFixed(3);
    f.be = +f.be.toFixed(3);
    f.pe = +f.pe.toFixed(3);
    f.status = f.photos === f.need ? "หลักฐานครบ" : f.fallback ? "หลักฐานไม่ครบ · ถอย SF_w" : "กำลังเก็บหลักฐาน";
    f.tone = f.photos === f.need ? "success" : f.fallback ? "danger" : "warning";
    return f;
  });
})();

// คิวตรวจภาพ — 4 ภาพต่อครอป · เปียก 2 แห้ง 2 สลับกัน
const QUEUE = [{
  id: "PH-8841",
  code: "CPA1001",
  plot: "CPA1001/F01",
  round: "DRY-1",
  stage: "SG-05",
  stageName: "รอบที่ 1 · แห้ง",
  phase: "dry",
  water: "10 ซม.",
  when: "19 ส.ค. 07:41",
  gps: "14.9231, 100.1042",
  inside: true,
  age: "รอ 1 วัน",
  tone: "warning"
}, {
  id: "PH-8840",
  code: "CPA1002",
  plot: "CPA1002/F01",
  round: "WET-2",
  stage: "SG-07",
  stageName: "รอบที่ 2 · เปียก",
  phase: "wet",
  water: "0 ซม. (น้ำเต็ม)",
  when: "18 ส.ค. 08:02",
  gps: "ไม่มีพิกัด (ส่งทางแชต)",
  inside: false,
  age: "รอ 2 วัน",
  tone: "danger"
}, {
  id: "PH-8838",
  code: "CPA1004",
  plot: "CPA1004/F01",
  round: "DRY-2",
  stage: "SG-08",
  stageName: "รอบที่ 2 · แห้ง",
  phase: "dry",
  water: "14 ซม.",
  when: "18 ส.ค. 06:55",
  gps: "15.1802, 100.1265",
  inside: true,
  age: "รอ 2 วัน",
  tone: "warning"
}, {
  id: "PH-8835",
  code: "CPA1006",
  plot: "CPA1006/F01",
  round: "WET-1",
  stage: "SG-04",
  stageName: "รอบที่ 1 · เปียก",
  phase: "wet",
  water: "0 ซม. (น้ำเต็ม)",
  when: "17 ส.ค. 16:20",
  gps: "14.9410, 100.0988",
  inside: true,
  age: "รอ 3 วัน",
  tone: "warning"
}, {
  id: "PH-8830",
  code: "CPA1013",
  plot: "CPA1013/F02",
  round: "DRY-1",
  stage: "SG-05",
  stageName: "รอบที่ 1 · แห้ง",
  phase: "dry",
  water: "8 ซม.",
  when: "17 ส.ค. 07:12",
  gps: "14.9302, 100.1120",
  inside: true,
  age: "รอ 3 วัน",
  tone: "warning"
}];
const REJECT_REASONS = ["มองไม่เห็นขีดระดับน้ำในท่อ", "ภาพเบลอ / มืดเกินไป", "พิกัดตกนอกขอบเขตแปลง", "เวลาถ่ายไม่อยู่ในช่วงกำหนดของรอบนี้", "รอบแห้งแต่ในภาพน้ำยังเต็มท่อ (หรือกลับกัน)", "ไม่ใช่ท่อวัดระดับน้ำของแปลงนี้", "ส่งภาพจากคลังภาพ ไม่ได้ถ่ายผ่านกล้องของระบบ"];

// เครดิตรายฤดู — ปี 2569 เป็นค่าจริงจากชีต 3.7 สรุปGHG ส่วนฤดูก่อนหน้าเป็นรอบที่ทวนสอบแล้ว
const SEASONS = [{
  label: "นาปี 2568",
  baseline: 652.3,
  estimate: 342.1,
  verified: 323.4
}, {
  label: "นาปรัง 2568",
  baseline: 251.0,
  estimate: 39.6,
  verified: 32.4
}, {
  label: "นาปี 2569 (S1)",
  baseline: 664.9,
  estimate: 249.4,
  verified: 0
}, {
  label: "นาปรัง 2569 (S2)",
  baseline: 263.3,
  estimate: 169.2,
  verified: 0
}];
const EXPORTS = [{
  id: "EX-2041",
  name: "รายงานเกษตรกรรายบุคคล",
  fmt: "XLSX",
  scope: "ราย CPA code · ทุกพื้นที่",
  note: "หนึ่งชีตต่อหนึ่ง CPA code · หัวชีตใช้รหัส ไม่ใช้ชื่อ",
  who: "แอดมิน"
}, {
  id: "EX-2042",
  name: "สรุปเครดิตประมาณการรายฤดู",
  fmt: "XLSX",
  scope: "รายพื้นที่ · รายฤดู",
  note: "BE_s / PE_s / ER_y ต่อแปลง พร้อมค่ากลางทุกตัว (ef_ch4, sf_w, sf_o)",
  who: "แอดมิน · ลูกค้า"
}, {
  id: "EX-2043",
  name: "แบบฟอร์มขอขึ้นทะเบียน Premium T-VER",
  fmt: "DOCX",
  scope: "ทั้งโครงการ",
  note: "T-VER-P-METH-13-08 ฉบับที่ 01 · เติมข้อมูลโครงการและ WKT ขอบแปลงอัตโนมัติ",
  who: "แอดมิน"
}, {
  id: "EX-2044",
  name: "ไฟล์คำนวณเครดิต Premium T-VER",
  fmt: "XLSX",
  scope: "ทั้งโครงการ",
  note: "โครงเดียวกับ NZC - การคำนวณ AWD.xlsx · ชีต 3.1 ถึง 3.7 · ไล่ย้อนได้ทุกค่า",
  who: "แอดมิน"
}, {
  id: "EX-2045",
  name: "ทะเบียนเอกสารสิทธิ์และความยินยอม",
  fmt: "XLSX",
  scope: "รายโฉนด",
  note: "DOC-01 ถึง DOC-06 · CS-01 ถึง CS-04 พร้อมวันเวลาและเวอร์ชันข้อความ",
  who: "แอดมิน"
}, {
  id: "EX-2046",
  name: "รายงานการทวนสอบภาพหลักฐาน",
  fmt: "XLSX",
  scope: "รายภาพ · 4 ภาพต่อครอป",
  note: "พิกัด เวลา ผู้ตรวจ เหตุผลที่ตีกลับ และ SF_w ที่ใช้จริง",
  who: "แอดมิน · ผู้ประเมินภายนอก"
}];

// รายแถวปุ๋ย — หน้าตรวจที่มาของไนโตรเจน (AD-18 · F-71)
const NITROGEN_ROWS = [{
  no: 1,
  formula: "16-8-8",
  src: "รายการมาตรฐาน FT-03",
  pctN: 16,
  rate: 25,
  urea: false,
  stage: "SG-03 · รองพื้น",
  photo: true
}, {
  no: 2,
  formula: "46-0-0",
  src: "รายการมาตรฐาน FT-02",
  pctN: 46,
  rate: 20,
  urea: true,
  stage: "SG-06 · แตกกอ",
  photo: true
}, {
  no: 3,
  formula: "18-12-6",
  src: "เกษตรกรพิมพ์เอง",
  pctN: 18,
  rate: 20,
  urea: false,
  stage: "SG-09 · ก่อนออกรวง",
  photo: false
}];
Object.assign(window, {
  SPONSORS,
  PROVINCES,
  PLOTS,
  FARMERS,
  FARMER_NAMES,
  QUEUE,
  REJECT_REASONS,
  SEASONS,
  EXPORTS,
  NITROGEN_ROWS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin_console/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/line_oa_farmer/LiffScreens.jsx
try { (() => {
const {
  Button,
  Field,
  Input,
  Select,
  Checkbox,
  Badge,
  Tag,
  Icon,
  ProgressBar,
  GradientRule
} = window.NetZeroCarbonDesignSystem_f3e7a8;
function LiffShell({
  title,
  subtitle,
  onClose,
  children,
  footer
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "var(--white)",
      display: "flex",
      flexDirection: "column",
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--gradient-deep)",
      color: "#fff",
      padding: "12px 14px",
      display: "flex",
      alignItems: "flex-start",
      gap: "10px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "26px",
      height: "26px",
      borderRadius: "var(--radius-circle)",
      background: "#fff",
      display: "grid",
      placeItems: "center",
      flex: "none",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logos/NZC-Mark-Full.png",
    alt: "",
    style: {
      width: "22px",
      height: "22px",
      objectFit: "contain"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "14px",
      fontWeight: "var(--weight-bold)",
      lineHeight: 1.25
    }
  }, title), subtitle ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "10.5px",
      opacity: .82,
      marginTop: "2px"
    }
  }, subtitle) : null), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      color: "#fff",
      fontSize: "17px",
      cursor: "pointer",
      lineHeight: 1
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "14px",
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      background: "var(--grey-50)"
    }
  }, children), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)",
      background: "#fff",
      padding: "10px 14px"
    }
  }, footer) : null);
}
function Panel({
  title,
  hint,
  children,
  tone
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: tone === "warn" ? "var(--status-warning-soft)" : "var(--white)",
      border: "1px solid " + (tone === "warn" ? "#F2DDB4" : "var(--border-subtle)"),
      borderRadius: "var(--radius-md)",
      padding: "12px 13px",
      display: "flex",
      flexDirection: "column",
      gap: "9px"
    }
  }, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)"
    }
  }, title) : null, hint ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "var(--text-subtle)",
      lineHeight: 1.55,
      marginTop: "-4px"
    }
  }, hint) : null, children);
}

// LF-01 · หน้าสมัครบัญชีด้วยตัวเอง
function LiffRegister({
  onClose
}) {
  const [step, setStep] = React.useState(1);
  return /*#__PURE__*/React.createElement(LiffShell, {
    title: "\u0E1F\u0E2D\u0E23\u0E4C\u0E21\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E40\u0E02\u0E49\u0E32\u0E23\u0E48\u0E27\u0E21\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23",
    subtitle: "LF-01 · ขั้นที่ " + step + " จาก 2",
    onClose: onClose,
    footer: step === 1 ? /*#__PURE__*/React.createElement(Button, {
      fullWidth: true,
      onClick: () => setStep(2),
      iconRight: /*#__PURE__*/React.createElement(Icon, {
        name: "arrow-right",
        size: 15
      })
    }, "\u0E15\u0E48\u0E2D\u0E44\u0E1B \xB7 \u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E41\u0E1B\u0E25\u0E07") : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "8px"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      onClick: () => setStep(1)
    }, "\u0E22\u0E49\u0E2D\u0E19\u0E01\u0E25\u0E31\u0E1A"), /*#__PURE__*/React.createElement(Button, {
      fullWidth: true,
      onClick: onClose
    }, "\u0E2A\u0E48\u0E07\u0E43\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "6px"
    }
  }, [1, 2].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      flex: 1,
      height: "4px",
      borderRadius: "var(--radius-pill)",
      background: i <= step ? "var(--teal-600)" : "var(--grey-200)"
    }
  }))), step === 1 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Panel, {
    title: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E02\u0E2D\u0E07\u0E17\u0E48\u0E32\u0E19",
    hint: "R-01 \u0E16\u0E36\u0E07 R-06 \xB7 \u0E01\u0E23\u0E2D\u0E01\u0E43\u0E2B\u0E49\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E1A\u0E31\u0E15\u0E23\u0E1B\u0E23\u0E30\u0E0A\u0E32\u0E0A\u0E19"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "\u0E0A\u0E37\u0E48\u0E2D - \u0E19\u0E32\u0E21\u0E2A\u0E01\u0E38\u0E25",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: "\u0E2A\u0E21\u0E0A\u0E32\u0E22 \u0E43\u0E08\u0E14\u0E35"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\u0E40\u0E1E\u0E28"
  }, /*#__PURE__*/React.createElement(Select, {
    defaultValue: "\u0E0A\u0E32\u0E22"
  }, /*#__PURE__*/React.createElement("option", null, "\u0E0A\u0E32\u0E22"), /*#__PURE__*/React.createElement("option", null, "\u0E2B\u0E0D\u0E34\u0E07"), /*#__PURE__*/React.createElement("option", null, "\u0E44\u0E21\u0E48\u0E23\u0E30\u0E1A\u0E38"))), /*#__PURE__*/React.createElement(Field, {
    label: "\u0E40\u0E1A\u0E2D\u0E23\u0E4C\u0E42\u0E17\u0E23\u0E28\u0E31\u0E1E\u0E17\u0E4C",
    hint: "\u0E21\u0E32\u0E08\u0E32\u0E01\u0E1B\u0E38\u0E48\u0E21\u0E41\u0E0A\u0E23\u0E4C\u0E40\u0E1A\u0E2D\u0E23\u0E4C\u0E02\u0E2D\u0E07 LINE"
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: "081-234-5678",
    readOnly: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\u0E40\u0E25\u0E02\u0E1A\u0E31\u0E15\u0E23\u0E1B\u0E23\u0E30\u0E0A\u0E32\u0E0A\u0E19",
    required: true,
    hint: "\u0E40\u0E01\u0E47\u0E1A\u0E41\u0E1A\u0E1A\u0E40\u0E02\u0E49\u0E32\u0E23\u0E2B\u0E31\u0E2A \u0E41\u0E2A\u0E14\u0E07\u0E40\u0E09\u0E1E\u0E32\u0E30 4 \u0E15\u0E31\u0E27\u0E17\u0E49\u0E32\u0E22"
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u20225678"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48\u0E15\u0E32\u0E21\u0E17\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19\u0E1A\u0E49\u0E32\u0E19",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: "\u0E15.\u0E2B\u0E19\u0E2D\u0E07\u0E1C\u0E31\u0E01\u0E19\u0E32\u0E01 \u0E2D.\u0E2A\u0E32\u0E21\u0E0A\u0E38\u0E01 \u0E08.\u0E2A\u0E38\u0E1E\u0E23\u0E23\u0E13\u0E1A\u0E38\u0E23\u0E35"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\u0E01\u0E25\u0E38\u0E48\u0E21 / \u0E2A\u0E2B\u0E01\u0E23\u0E13\u0E4C"
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: "\u0E27\u0E34\u0E2A\u0E32\u0E2B\u0E01\u0E34\u0E08\u0E0A\u0E38\u0E21\u0E0A\u0E19\u0E2A\u0E32\u0E21\u0E0A\u0E38\u0E01\u0E23\u0E48\u0E27\u0E21\u0E43\u0E08"
  })))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Panel, {
    title: "\u0E17\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19\u0E42\u0E09\u0E19\u0E14",
    hint: "R-07 \u0E16\u0E36\u0E07 R-14 \xB7 \u0E40\u0E1E\u0E34\u0E48\u0E21\u0E44\u0E14\u0E49\u0E2B\u0E25\u0E32\u0E22\u0E43\u0E1A \u0E41\u0E15\u0E48\u0E25\u0E30\u0E43\u0E1A\u0E23\u0E30\u0E1A\u0E38\u0E08\u0E33\u0E19\u0E27\u0E19\u0E41\u0E1B\u0E25\u0E07"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "\u0E40\u0E25\u0E02\u0E42\u0E09\u0E19\u0E14",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: "7218"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C"
  }, /*#__PURE__*/React.createElement(Select, {
    defaultValue: "\u0E42\u0E09\u0E19\u0E14"
  }, /*#__PURE__*/React.createElement("option", null, "\u0E42\u0E09\u0E19\u0E14"), /*#__PURE__*/React.createElement("option", null, "\u0E19.\u0E2A.3\u0E01"), /*#__PURE__*/React.createElement("option", null, "\u0E2A.\u0E1B.\u0E01."))), /*#__PURE__*/React.createElement(Field, {
    label: "\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E01\u0E32\u0E23\u0E16\u0E37\u0E2D\u0E04\u0E23\u0E2D\u0E07",
    required: true
  }, /*#__PURE__*/React.createElement(Select, {
    defaultValue: "\u0E40\u0E08\u0E49\u0E32\u0E02\u0E2D\u0E07"
  }, /*#__PURE__*/React.createElement("option", null, "\u0E40\u0E08\u0E49\u0E32\u0E02\u0E2D\u0E07"), /*#__PURE__*/React.createElement("option", null, "\u0E40\u0E08\u0E49\u0E32\u0E02\u0E2D\u0E07\u0E23\u0E48\u0E27\u0E21"), /*#__PURE__*/React.createElement("option", null, "\u0E1C\u0E39\u0E49\u0E40\u0E0A\u0E48\u0E32"), /*#__PURE__*/React.createElement("option", null, "\u0E1C\u0E39\u0E49\u0E23\u0E31\u0E1A\u0E21\u0E2D\u0E1A\u0E2D\u0E33\u0E19\u0E32\u0E08"))), /*#__PURE__*/React.createElement(Field, {
    label: "\u0E42\u0E09\u0E19\u0E14\u0E43\u0E1A\u0E19\u0E35\u0E49\u0E21\u0E35\u0E01\u0E35\u0E48\u0E41\u0E1B\u0E25\u0E07",
    hint: "\u0E23\u0E30\u0E1A\u0E1A\u0E23\u0E31\u0E19\u0E23\u0E2B\u0E31\u0E2A\u0E41\u0E1B\u0E25\u0E07\u0E43\u0E2B\u0E49\u0E40\u0E2D\u0E07: CPA1001/F01, CPA1001/F02"
  }, /*#__PURE__*/React.createElement(Select, {
    defaultValue: "1 \u0E41\u0E1B\u0E25\u0E07"
  }, /*#__PURE__*/React.createElement("option", null, "1 \u0E41\u0E1B\u0E25\u0E07"), /*#__PURE__*/React.createElement("option", null, "2 \u0E41\u0E1B\u0E25\u0E07"), /*#__PURE__*/React.createElement("option", null, "3 \u0E41\u0E1B\u0E25\u0E07"))), /*#__PURE__*/React.createElement(Field, {
    label: "\u0E40\u0E19\u0E37\u0E49\u0E2D\u0E17\u0E35\u0E48\u0E23\u0E32\u0E22\u0E41\u0E1B\u0E25\u0E07 (\u0E44\u0E23\u0E48)",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: "2.40"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\u0E1E\u0E31\u0E19\u0E18\u0E38\u0E4C\u0E02\u0E49\u0E32\u0E27",
    hint: "R-14 \xB7 \u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E0B\u0E49\u0E33\u0E17\u0E38\u0E01\u0E24\u0E14\u0E39 \xB7 \u0E01\u0E33\u0E2B\u0E19\u0E14\u0E23\u0E2D\u0E1A\u0E1B\u0E25\u0E39\u0E01 120 \u0E27\u0E31\u0E19"
  }, /*#__PURE__*/React.createElement(Select, {
    defaultValue: "\u0E2B\u0E2D\u0E21\u0E1B\u0E17\u0E38\u0E21"
  }, /*#__PURE__*/React.createElement("option", null, "\u0E2B\u0E2D\u0E21\u0E1B\u0E17\u0E38\u0E21"), /*#__PURE__*/React.createElement("option", null, "\u0E01\u0E0285"), /*#__PURE__*/React.createElement("option", null, "\u0E01\u0E0243"), /*#__PURE__*/React.createElement("option", null, "\u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E40\u0E2D\u0E07")))), /*#__PURE__*/React.createElement(Panel, {
    title: "\u0E1E\u0E34\u0E01\u0E31\u0E14\u0E01\u0E25\u0E32\u0E07\u0E41\u0E1B\u0E25\u0E07",
    hint: "\u0E01\u0E14\u0E1B\u0E38\u0E48\u0E21\u0E41\u0E25\u0E49\u0E27\u0E22\u0E37\u0E19\u0E17\u0E35\u0E48\u0E01\u0E25\u0E32\u0E07\u0E41\u0E1B\u0E25\u0E07 \u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E30\u0E08\u0E31\u0E1A\u0E1E\u0E34\u0E01\u0E31\u0E14\u0E43\u0E2B\u0E49"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "84px",
      borderRadius: "var(--radius-sm)",
      background: "linear-gradient(150deg,#CFE3B9,#8FA95C)",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%,-50%)",
      color: "#fff",
      fontSize: "20px"
    }
  }, "\u25C9")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "11px",
      color: "var(--text-muted)"
    }
  }, "14.9231, 100.1042"))));
}

// OB-13 · แนบเอกสารสิทธิ์
function LiffDocs({
  onClose
}) {
  const [done, setDone] = React.useState({
    "DOC-01": true,
    "DOC-03": false,
    "DOC-06": false
  });
  const list = [["DOC-01", "โฉนดที่ดิน หน้า-หลัง", "เกษตรกร"], ["DOC-03", "สำเนาบัตรประชาชน", "เกษตรกร"], ["DOC-06", "หนังสือมอบอำนาจ", "บริษัทมีแบบฟอร์มให้"]];
  const n = Object.values(done).filter(Boolean).length;
  return /*#__PURE__*/React.createElement(LiffShell, {
    title: "\u0E41\u0E19\u0E1A\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C",
    subtitle: "แปลง CPA1001/F01 · ครบแล้ว " + n + "/3 รายการ",
    onClose: onClose,
    footer: /*#__PURE__*/React.createElement(Button, {
      fullWidth: true,
      disabled: n < 3,
      onClick: onClose
    }, n < 3 ? "ยังแนบไม่ครบ" : "ส่งใบสมัคร")
  }, /*#__PURE__*/React.createElement(Panel, {
    tone: "warn",
    title: "\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E44\u0E21\u0E48\u0E04\u0E23\u0E1A = \u0E2A\u0E48\u0E07\u0E43\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49",
    hint: "\u0E17\u0E38\u0E01\u0E09\u0E1A\u0E31\u0E1A\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E0B\u0E47\u0E19\u0E23\u0E31\u0E1A\u0E23\u0E2D\u0E07\u0E2A\u0E33\u0E40\u0E19\u0E32\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 \u0E41\u0E25\u0E30\u0E23\u0E30\u0E1A\u0E38\u0E27\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17\u0E40\u0E19\u0E17\u0E0B\u0E35\u0E42\u0E23\u0E04\u0E32\u0E23\u0E4C\u0E1A\u0E2D\u0E19 \u0E08\u0E33\u0E01\u0E31\u0E14"
  }), list.map(([code, name, by]) => /*#__PURE__*/React.createElement("div", {
    key: code,
    style: {
      background: "#fff",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      padding: "12px 13px",
      display: "flex",
      gap: "11px",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "44px",
      height: "56px",
      borderRadius: "4px",
      flex: "none",
      background: done[code] ? "linear-gradient(160deg,#E7FCF7,#8FF3DE)" : "var(--grey-100)",
      border: "1px solid var(--border-subtle)",
      display: "grid",
      placeItems: "center",
      color: done[code] ? "var(--teal-700)" : "var(--grey-400)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: done[code] ? "file-check" : "file-plus",
    size: 19
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontFamily: "var(--font-mono)",
      fontSize: "10px",
      color: "var(--text-subtle)"
    }
  }, code), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "13px",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)"
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "10.5px",
      color: "var(--text-subtle)"
    }
  }, by)), done[code] ? /*#__PURE__*/React.createElement(Badge, {
    tone: "success"
  }, "\u0E41\u0E19\u0E1A\u0E41\u0E25\u0E49\u0E27") : /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: () => setDone({
      ...done,
      [code]: true
    })
  }, "\u0E16\u0E48\u0E32\u0E22"))));
}

// LF-04 · หน้ากล้องบังคับ — หัวใจของหลักฐาน
function LiffCamera({
  onClose
}) {
  const [shot, setShot] = React.useState(false);
  return /*#__PURE__*/React.createElement(LiffShell, {
    title: "\u0E01\u0E25\u0E49\u0E2D\u0E07\u0E02\u0E2D\u0E07\u0E23\u0E30\u0E1A\u0E1A",
    subtitle: "LF-04 \xB7 DRY-1 \xB7 \u0E23\u0E2D\u0E1A\u0E17\u0E35\u0E48 1 \u0E0A\u0E48\u0E27\u0E07\u0E41\u0E2B\u0E49\u0E07 (SG-05)",
    onClose: onClose,
    footer: shot ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "8px"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      onClick: () => setShot(false)
    }, "\u0E16\u0E48\u0E32\u0E22\u0E43\u0E2B\u0E21\u0E48"), /*#__PURE__*/React.createElement(Button, {
      fullWidth: true,
      onClick: onClose
    }, "\u0E43\u0E0A\u0E49\u0E20\u0E32\u0E1E\u0E19\u0E35\u0E49")) : /*#__PURE__*/React.createElement(Button, {
      fullWidth: true,
      onClick: () => setShot(true),
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "camera",
        size: 16
      })
    }, "\u0E16\u0E48\u0E32\u0E22\u0E20\u0E32\u0E1E")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      borderRadius: "var(--radius-md)",
      overflow: "hidden",
      height: "240px",
      background: "linear-gradient(180deg,#9FC7E8 0%,#CFE3B9 52%,#8FA95C 100%)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "50%",
      top: "22%",
      transform: "translateX(-50%)",
      width: "26px",
      height: "122px",
      background: "#E7EDF2",
      borderRadius: "4px",
      boxShadow: "0 0 0 1px rgba(0,0,0,.18)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: "18px",
      border: "2px dashed rgba(255,255,255,.72)",
      borderRadius: "var(--radius-sm)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "50%",
      bottom: "44px",
      transform: "translateX(-50%)",
      background: "rgba(0,0,0,.5)",
      color: "#fff",
      fontSize: "11px",
      padding: "3px 9px",
      borderRadius: "var(--radius-pill)"
    }
  }, "\u0E27\u0E32\u0E07\u0E17\u0E48\u0E2D PVC \u0E43\u0E2B\u0E49\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E01\u0E23\u0E2D\u0E1A"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "8px",
      bottom: "8px",
      background: "rgba(0,0,0,.58)",
      color: "#fff",
      fontFamily: "var(--font-mono)",
      fontSize: "10px",
      padding: "3px 7px",
      borderRadius: "5px"
    }
  }, "14.9231, 100.1042 \xB7 07:41"), shot ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: "8px",
      top: "8px"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "success"
  }, "\u0E21\u0E35\u0E1E\u0E34\u0E01\u0E31\u0E14\u0E41\u0E25\u0E30\u0E40\u0E27\u0E25\u0E32")) : null), /*#__PURE__*/React.createElement(Panel, {
    title: "\u0E23\u0E2D\u0E1A\u0E19\u0E35\u0E49\u0E04\u0E37\u0E2D\u0E0A\u0E48\u0E27\u0E07\u0E41\u0E2B\u0E49\u0E07 \u2014 \u0E16\u0E48\u0E32\u0E22\u0E43\u0E2B\u0E49\u0E40\u0E2B\u0E47\u0E19\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E19\u0E49\u0E33\u0E15\u0E48\u0E33\u0E01\u0E27\u0E48\u0E32\u0E1C\u0E34\u0E27\u0E14\u0E34\u0E19",
    hint: "\u0E22\u0E37\u0E19\u0E2B\u0E48\u0E32\u0E07\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 1 \u0E40\u0E21\u0E15\u0E23 \xB7 \u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E34\u0E14 GPS \xB7 \u0E20\u0E32\u0E1E\u0E17\u0E35\u0E48\u0E2A\u0E48\u0E07\u0E17\u0E32\u0E07\u0E41\u0E0A\u0E15\u0E43\u0E0A\u0E49\u0E40\u0E1B\u0E47\u0E19\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49 \u0E40\u0E1E\u0E23\u0E32\u0E30 LINE \u0E15\u0E31\u0E14\u0E1E\u0E34\u0E01\u0E31\u0E14\u0E41\u0E25\u0E30\u0E40\u0E27\u0E25\u0E32\u0E16\u0E48\u0E32\u0E22\u0E17\u0E34\u0E49\u0E07 \xB7 \u0E04\u0E23\u0E2D\u0E1B\u0E19\u0E35\u0E49\u0E15\u0E49\u0E2D\u0E07\u0E2A\u0E48\u0E07\u0E04\u0E23\u0E1A 4 \u0E20\u0E32\u0E1E (\u0E40\u0E1B\u0E35\u0E22\u0E01 2 \xB7 \u0E41\u0E2B\u0E49\u0E07 2)"
  }), shot ? /*#__PURE__*/React.createElement(Panel, {
    title: "\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E19\u0E49\u0E33\u0E43\u0E19\u0E17\u0E48\u0E2D (\u0E0B\u0E21.)",
    hint: "\u0E2D\u0E48\u0E32\u0E19\u0E08\u0E32\u0E01\u0E02\u0E35\u0E14\u0E1A\u0E19\u0E17\u0E48\u0E2D \u2014 \u0E15\u0E48\u0E33\u0E01\u0E27\u0E48\u0E32\u0E1C\u0E34\u0E27\u0E14\u0E34\u0E19\u0E01\u0E35\u0E48\u0E40\u0E0B\u0E19\u0E15\u0E34\u0E40\u0E21\u0E15\u0E23"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "6px",
      flexWrap: "wrap"
    }
  }, ["0", "5", "10", "15", ">15", "พิมพ์เอง"].map((v, i) => /*#__PURE__*/React.createElement("span", {
    key: v,
    style: {
      padding: "7px 13px",
      borderRadius: "var(--radius-pill)",
      border: "1px solid " + (i === 2 ? "var(--teal-600)" : "var(--border-default)"),
      background: i === 2 ? "var(--teal-600)" : "#fff",
      color: i === 2 ? "#fff" : "var(--text-body)",
      fontSize: "12px",
      fontWeight: "var(--weight-semibold)"
    }
  }, v)))) : null);
}

// PJ-13 · ปฏิทิน 9 ขั้น
function LiffCalendar({
  onClose
}) {
  const stages = [["SG-01", "เตรียมแปลง", "วันที่ -20 ถึง -1", "done", ""], ["SG-02", "หว่าน / ปักดำ", "วันที่ 0 · 1 ก.ค.", "done", ""], ["SG-03", "ใส่ปุ๋ยเคมีครั้งที่ 1", "อายุ 15-25 วัน", "done", ""], ["SG-04", "ภาพรอบที่ 1 · เปียก", "วันที่ 28 · ส่งแล้ว", "done", "wet"], ["SG-05", "ภาพรอบที่ 1 · แห้ง", "วันที่ 42 · เหลือ 3 วัน", "now", "dry"], ["SG-06", "ใส่ปุ๋ยเคมีครั้งที่ 2", "อายุ 45-55 วัน", "next", ""], ["SG-07", "ภาพรอบที่ 2 · เปียก", "วันที่ 61", "lock", "wet"], ["SG-08", "ภาพรอบที่ 2 · แห้ง", "วันที่ 75", "lock", "dry"], ["SG-09", "เก็บเกี่ยว และจัดการฟาง", "ตามพันธุ์ข้าว 120 วัน", "lock", ""]];
  const mark = {
    done: ["✓", "var(--teal-600)", "#fff"],
    now: ["●", "var(--status-warning)", "#fff"],
    next: ["○", "var(--white)", "var(--text-subtle)"],
    lock: ["🔒", "var(--grey-100)", "var(--grey-500)"]
  };
  return /*#__PURE__*/React.createElement(LiffShell, {
    title: "\u0E1B\u0E0F\u0E34\u0E17\u0E34\u0E19\u0E24\u0E14\u0E39\u0E19\u0E35\u0E49",
    subtitle: "\u0E41\u0E1B\u0E25\u0E07\u0E19\u0E32\u0E2B\u0E25\u0E31\u0E07\u0E1A\u0E49\u0E32\u0E19 \xB7 \u0E19\u0E32\u0E1B\u0E35 2569 \xB7 9 \u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19",
    onClose: onClose,
    footer: /*#__PURE__*/React.createElement(Button, {
      fullWidth: true,
      onClick: onClose
    }, "\u0E16\u0E48\u0E32\u0E22\u0E20\u0E32\u0E1E\u0E23\u0E2D\u0E1A\u0E17\u0E35\u0E48 1 \xB7 \u0E41\u0E2B\u0E49\u0E07 (SG-05)")
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "\u0E04\u0E27\u0E32\u0E21\u0E04\u0E37\u0E1A\u0E2B\u0E19\u0E49\u0E32 4/9 \u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19",
    hint: "\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E02\u0E2D\u0E07\u0E41\u0E15\u0E48\u0E25\u0E30\u0E02\u0E31\u0E49\u0E19\u0E04\u0E33\u0E19\u0E27\u0E13\u0E08\u0E32\u0E01\u0E27\u0E31\u0E19\u0E2B\u0E27\u0E48\u0E32\u0E19\u0E1A\u0E27\u0E01\u0E2D\u0E32\u0E22\u0E38\u0E02\u0E2D\u0E07\u0E1E\u0E31\u0E19\u0E18\u0E38\u0E4C\u0E02\u0E49\u0E32\u0E27 (120 \u0E27\u0E31\u0E19)"
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: 4,
    max: 9,
    valueLabel: "4/9"
  })), /*#__PURE__*/React.createElement(Panel, {
    tone: "warn",
    title: "\u0E20\u0E32\u0E1E\u0E17\u0E48\u0E2D\u0E27\u0E31\u0E14\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E19\u0E49\u0E33 4 \u0E23\u0E2D\u0E1A\u0E15\u0E48\u0E2D\u0E04\u0E23\u0E2D\u0E1B",
    hint: "\u0E40\u0E1B\u0E35\u0E22\u0E01 2 \u0E04\u0E23\u0E31\u0E49\u0E07 \u0E41\u0E2B\u0E49\u0E07 2 \u0E04\u0E23\u0E31\u0E49\u0E07 \u0E2A\u0E25\u0E31\u0E1A\u0E01\u0E31\u0E19 \u2014 \u0E15\u0E49\u0E2D\u0E07\u0E04\u0E23\u0E1A\u0E17\u0E31\u0E49\u0E07 4 \u0E20\u0E32\u0E1E \u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E08\u0E36\u0E07\u0E04\u0E34\u0E14\u0E44\u0E14\u0E49\u0E40\u0E15\u0E47\u0E21 \u0E16\u0E49\u0E32\u0E44\u0E21\u0E48\u0E04\u0E23\u0E1A\u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E30\u0E04\u0E34\u0E14\u0E43\u0E2B\u0E49\u0E15\u0E48\u0E33\u0E25\u0E07\u0E42\u0E14\u0E22\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "6px"
    }
  }, [["เปียก 1", true], ["แห้ง 1", false], ["เปียก 2", false], ["แห้ง 2", false]].map(([l, ok]) => /*#__PURE__*/React.createElement("span", {
    key: l,
    style: {
      flex: 1,
      textAlign: "center",
      padding: "7px 4px",
      borderRadius: "var(--radius-sm)",
      fontSize: "11px",
      fontWeight: "var(--weight-semibold)",
      background: ok ? "var(--teal-600)" : "var(--white)",
      color: ok ? "#fff" : "var(--text-subtle)",
      border: "1px solid " + (ok ? "var(--teal-600)" : "var(--border-default)")
    }
  }, l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      overflow: "hidden"
    }
  }, stages.map(([code, name, when, st, phase], i) => {
    const [g, bg, fg] = mark[st];
    return /*#__PURE__*/React.createElement("div", {
      key: code,
      style: {
        display: "flex",
        gap: "11px",
        alignItems: "center",
        padding: "11px 13px",
        borderBottom: i === stages.length - 1 ? "none" : "1px solid var(--grey-100)",
        background: st === "now" ? "var(--status-warning-soft)" : "#fff"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: "24px",
        height: "24px",
        flex: "none",
        borderRadius: "var(--radius-circle)",
        background: bg,
        color: fg,
        display: "grid",
        placeItems: "center",
        fontSize: "11px",
        border: st === "next" ? "1px solid var(--border-default)" : "none"
      }
    }, g), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: "12.5px",
        fontWeight: "var(--weight-semibold)",
        color: "var(--text-heading)"
      }
    }, name), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: "10.5px",
        color: "var(--text-subtle)"
      }
    }, code, " \xB7 ", when, phase ? phase === "wet" ? " · 📷 น้ำเต็มท่อ" : " · 📷 น้ำต่ำกว่าผิวดิน" : "")), st === "now" ? /*#__PURE__*/React.createElement(Button, {
      size: "sm"
    }, "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01") : null);
  })));
}

// RP-05 / LF-12 · แดชบอร์ดความคืบหน้าของฉัน
function LiffSummary({
  onClose
}) {
  const [tab, setTab] = React.useState("ผล");
  return /*#__PURE__*/React.createElement(LiffShell, {
    title: "\u0E41\u0E14\u0E0A\u0E1A\u0E2D\u0E23\u0E4C\u0E14\u0E02\u0E2D\u0E07\u0E09\u0E31\u0E19",
    subtitle: "CPA1001 \xB7 \u0E41\u0E1B\u0E25\u0E07\u0E19\u0E32\u0E2B\u0E25\u0E31\u0E07\u0E1A\u0E49\u0E32\u0E19 \xB7 \u0E19\u0E32\u0E1B\u0E35 2569",
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "4px",
      background: "var(--grey-100)",
      padding: "3px",
      borderRadius: "var(--radius-pill)"
    }
  }, ["ผล", "เครดิต", "ภาพ"].map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setTab(t),
    style: {
      flex: 1,
      border: "none",
      borderRadius: "var(--radius-pill)",
      padding: "7px 4px",
      fontFamily: "var(--font-sans)",
      fontSize: "12px",
      fontWeight: "var(--weight-semibold)",
      cursor: "pointer",
      background: tab === t ? "#fff" : "transparent",
      color: tab === t ? "var(--teal-700)" : "var(--text-muted)",
      boxShadow: tab === t ? "var(--shadow-xs)" : "none"
    }
  }, t))), tab === "ผล" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--gradient-deep)",
      color: "#fff",
      borderRadius: "var(--radius-md)",
      padding: "15px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: "var(--teal-300)",
      fontWeight: "var(--weight-semibold)"
    }
  }, "\u0E04\u0E32\u0E23\u0E4C\u0E1A\u0E2D\u0E19\u0E17\u0E35\u0E48\u0E25\u0E14\u0E44\u0E14\u0E49 (\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E01\u0E32\u0E23)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "7px",
      marginTop: "5px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "38px",
      fontWeight: "var(--weight-light)",
      lineHeight: 1
    }
  }, "9.42"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "13px",
      opacity: .8
    }
  }, "tCO\u2082eq")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "10.5px",
      opacity: .72,
      marginTop: "6px",
      lineHeight: 1.5
    }
  }, "\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E01\u0E32\u0E23\u0E01\u0E48\u0E2D\u0E19\u0E17\u0E27\u0E19\u0E2A\u0E2D\u0E1A \xB7 \u0E16\u0E49\u0E32\u0E2A\u0E48\u0E07\u0E20\u0E32\u0E1E\u0E04\u0E23\u0E1A 4 \u0E23\u0E2D\u0E1A\u0E08\u0E30\u0E44\u0E14\u0E49\u0E40\u0E15\u0E47\u0E21\u0E04\u0E48\u0E32\u0E19\u0E35\u0E49 \u0E16\u0E49\u0E32\u0E44\u0E21\u0E48\u0E04\u0E23\u0E1A\u0E08\u0E30\u0E25\u0E14\u0E25\u0E07\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 6.1 tCO\u2082eq")), /*#__PURE__*/React.createElement(Panel, {
    title: "\u0E2A\u0E34\u0E48\u0E07\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E17\u0E33\u0E15\u0E48\u0E2D\u0E44\u0E1B",
    tone: "warn"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "8px",
      fontSize: "12px",
      color: "var(--text-body)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u23F1"), /*#__PURE__*/React.createElement("span", null, "\u0E16\u0E48\u0E32\u0E22\u0E20\u0E32\u0E1E\u0E23\u0E2D\u0E1A\u0E17\u0E35\u0E48 2 \xB7 \u0E40\u0E1B\u0E35\u0E22\u0E01 (SG-07) \u2014 \u0E27\u0E31\u0E19\u0E17\u0E35\u0E48 61 \u0E2B\u0E25\u0E31\u0E07\u0E2B\u0E27\u0E48\u0E32\u0E19")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "8px",
      fontSize: "12px",
      color: "var(--text-body)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u23F1"), /*#__PURE__*/React.createElement("span", null, "\u0E16\u0E48\u0E32\u0E22\u0E20\u0E32\u0E1E\u0E23\u0E2D\u0E1A\u0E17\u0E35\u0E48 2 \xB7 \u0E41\u0E2B\u0E49\u0E07 (SG-08) \u2014 \u0E27\u0E31\u0E19\u0E17\u0E35\u0E48 75 \u0E2B\u0E25\u0E31\u0E07\u0E2B\u0E27\u0E48\u0E32\u0E19")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "8px",
      fontSize: "12px",
      color: "var(--text-body)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u23F1"), /*#__PURE__*/React.createElement("span", null, "\u0E01\u0E23\u0E2D\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E22\u0E49\u0E2D\u0E19\u0E2B\u0E25\u0E31\u0E07\u0E2D\u0E35\u0E01 2 \u0E24\u0E14\u0E39"))), /*#__PURE__*/React.createElement(Panel, {
    title: "\u0E20\u0E32\u0E1E\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E04\u0E23\u0E2D\u0E1B\u0E19\u0E35\u0E49 2 \u0E08\u0E32\u0E01 4 \u0E20\u0E32\u0E1E",
    hint: "\u0E40\u0E1B\u0E35\u0E22\u0E01 2 \u0E04\u0E23\u0E31\u0E49\u0E07 \u0E41\u0E2B\u0E49\u0E07 2 \u0E04\u0E23\u0E31\u0E49\u0E07 \u0E2A\u0E25\u0E31\u0E1A\u0E01\u0E31\u0E19"
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    label: "\u0E20\u0E32\u0E1E\u0E17\u0E35\u0E48\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34\u0E41\u0E25\u0E49\u0E27",
    value: 2,
    max: 4,
    valueLabel: "2/4"
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E22\u0E49\u0E2D\u0E19\u0E2B\u0E25\u0E31\u0E07",
    value: 4,
    max: 6,
    valueLabel: "4/6 \u0E24\u0E14\u0E39",
    tone: "mint"
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "\u0E1B\u0E31\u0E08\u0E08\u0E31\u0E22\u0E01\u0E32\u0E23\u0E1C\u0E25\u0E34\u0E15\u0E04\u0E23\u0E1A",
    value: 7,
    max: 12,
    valueLabel: "7/12",
    tone: "navy"
  }))) : null, tab === "เครดิต" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Panel, {
    title: "\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E21\u0E32\u0E08\u0E32\u0E01\u0E44\u0E2B\u0E19",
    hint: "\u0E40\u0E01\u0E37\u0E2D\u0E1A\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14\u0E21\u0E32\u0E08\u0E32\u0E01\u0E21\u0E35\u0E40\u0E17\u0E19\u0E43\u0E19\u0E19\u0E32\u0E02\u0E49\u0E32\u0E27\u0E17\u0E35\u0E48\u0E25\u0E14\u0E25\u0E07\u0E40\u0E1E\u0E23\u0E32\u0E30\u0E1B\u0E25\u0E48\u0E2D\u0E22\u0E41\u0E2B\u0E49\u0E07\u0E2A\u0E25\u0E31\u0E1A\u0E40\u0E1B\u0E35\u0E22\u0E01"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12px",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)",
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u0E21\u0E35\u0E40\u0E17\u0E19\u0E08\u0E32\u0E01\u0E19\u0E32\u0E02\u0E49\u0E32\u0E27"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--status-success)"
    }
  }, "\u0E25\u0E14\u0E25\u0E07 70%")), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "\u0E01\u0E48\u0E2D\u0E19\u0E40\u0E02\u0E49\u0E32\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23",
    value: 100,
    max: 100,
    valueLabel: "100",
    tone: "grey"
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "\u0E24\u0E14\u0E39\u0E19\u0E35\u0E49 (\u0E17\u0E33 AWD)",
    value: 30,
    max: 100,
    valueLabel: "30"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: "1px",
      background: "var(--grey-100)",
      margin: "4px 0"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11.5px",
      color: "var(--text-muted)",
      lineHeight: 1.6
    }
  }, "\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text-heading)"
    }
  }, "\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E02\u0E2D\u0E43\u0E2B\u0E49\u0E25\u0E14\u0E1B\u0E38\u0E4B\u0E22"), " \u2014 \u0E22\u0E2D\u0E14\u0E1B\u0E38\u0E4B\u0E22\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E08\u0E30\u0E16\u0E39\u0E01\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E40\u0E17\u0E48\u0E32\u0E40\u0E14\u0E34\u0E21\u0E17\u0E31\u0E49\u0E07\u0E01\u0E48\u0E2D\u0E19\u0E41\u0E25\u0E30\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23 \u0E41\u0E15\u0E48\u0E22\u0E31\u0E07\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E23\u0E2D\u0E01\u0E43\u0E2B\u0E49\u0E04\u0E23\u0E1A \u0E40\u0E1E\u0E23\u0E32\u0E30\u0E1B\u0E38\u0E4B\u0E22\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E21\u0E01\u0E32\u0E23\u0E2D\u0E35\u0E01\u0E01\u0E4A\u0E32\u0E0B\u0E2B\u0E19\u0E36\u0E48\u0E07 (N\u2082O)")), /*#__PURE__*/React.createElement(Panel, {
    title: "\u0E20\u0E32\u0E1E\u0E04\u0E23\u0E1A 4 \u0E23\u0E2D\u0E1A = \u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E40\u0E15\u0E47\u0E21",
    hint: "\u0E16\u0E49\u0E32\u0E20\u0E32\u0E1E\u0E44\u0E21\u0E48\u0E04\u0E23\u0E1A \u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E30\u0E16\u0E37\u0E2D\u0E27\u0E48\u0E32\u0E1B\u0E25\u0E48\u0E2D\u0E22\u0E41\u0E2B\u0E49\u0E07\u0E44\u0E14\u0E49\u0E41\u0E04\u0E48 1 \u0E04\u0E23\u0E31\u0E49\u0E07 \u0E17\u0E33\u0E43\u0E2B\u0E49\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E25\u0E14\u0E25\u0E07"
  }, [["ส่งครบ 4 ภาพ (เปียก 2 · แห้ง 2)", "9.42 tCO₂eq", true], ["ส่งไม่ครบ", "6.12 tCO₂eq", false]].map(([a, b, ok]) => /*#__PURE__*/React.createElement("div", {
    key: a,
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: "8px",
      fontSize: "12px",
      padding: "7px 9px",
      borderRadius: "var(--radius-sm)",
      background: ok ? "var(--teal-50)" : "var(--grey-100)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: ok ? "var(--teal-800)" : "var(--text-muted)"
    }
  }, a), /*#__PURE__*/React.createElement("b", {
    style: {
      color: ok ? "var(--teal-800)" : "var(--text-muted)",
      fontFamily: "var(--font-mono)"
    }
  }, b)))), /*#__PURE__*/React.createElement(Panel, {
    title: "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E1B\u0E38\u0E4B\u0E22\u0E24\u0E14\u0E39\u0E19\u0E35\u0E49",
    hint: "3 \u0E04\u0E23\u0E31\u0E49\u0E07\u0E15\u0E48\u0E2D\u0E24\u0E14\u0E39 \xB7 \u0E23\u0E30\u0E1A\u0E1A\u0E04\u0E34\u0E14\u0E44\u0E19\u0E42\u0E15\u0E23\u0E40\u0E08\u0E19\u0E43\u0E2B\u0E49\u0E40\u0E2D\u0E07 = \u0E2D\u0E31\u0E15\u0E23\u0E32 \xD7 %N \xF7 100"
  }, [["ครั้งที่ 1 · รองพื้น", "16-8-8", "25 กก./ไร่", "4.00 กก.N"], ["ครั้งที่ 2 · แตกกอ", "46-0-0 ยูเรีย", "20 กก./ไร่", "9.20 กก.N"], ["ครั้งที่ 3", "ยังไม่บันทึก", "—", "—"]].map(([a, b, c, d]) => /*#__PURE__*/React.createElement("div", {
    key: a,
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: "8px",
      fontSize: "11.5px",
      padding: "5px 0",
      borderBottom: "1px dashed var(--grey-100)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)"
    }
  }, a), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)"
    }
  }, b), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-subtle)",
      fontFamily: "var(--font-mono)",
      fontSize: "10px"
    }
  }, c, " \u2192 ", d)))))) : null, tab === "ภาพ" ? /*#__PURE__*/React.createElement(Panel, {
    title: "\u0E20\u0E32\u0E1E\u0E17\u0E48\u0E2D\u0E27\u0E31\u0E14\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E19\u0E49\u0E33 4 \u0E23\u0E2D\u0E1A\u0E02\u0E2D\u0E07\u0E04\u0E23\u0E2D\u0E1B\u0E19\u0E35\u0E49",
    hint: "\u0E41\u0E15\u0E30\u0E20\u0E32\u0E1E\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E14\u0E39\u0E1E\u0E34\u0E01\u0E31\u0E14\u0E41\u0E25\u0E30\u0E40\u0E27\u0E25\u0E32 \xB7 \u0E20\u0E32\u0E1E\u0E17\u0E35\u0E48\u0E15\u0E35\u0E01\u0E25\u0E31\u0E1A\u0E15\u0E49\u0E2D\u0E07\u0E16\u0E48\u0E32\u0E22\u0E43\u0E2B\u0E21\u0E48"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "7px"
    }
  }, [["เปียก 1", "ผ่าน"], ["แห้ง 1", "ผ่าน"], ["เปียก 2", "ตีกลับ"], ["แห้ง 2", "ยังไม่ส่ง"]].map(([c, st], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: "relative",
      borderRadius: "var(--radius-sm)",
      overflow: "hidden",
      aspectRatio: "1 / 1",
      background: "linear-gradient(180deg,#9FC7E8,#8FA95C)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "50%",
      top: "24%",
      transform: "translateX(-50%)",
      width: "9px",
      height: "34px",
      background: "#E7EDF2",
      borderRadius: "2px"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: "auto 0 0 0",
      background: "rgba(0,0,0,.55)",
      color: "#fff",
      fontSize: "9px",
      padding: "2px 4px",
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", null, c), /*#__PURE__*/React.createElement("span", {
    style: {
      color: st === "ผ่าน" ? "#8FF3DE" : st === "ตีกลับ" ? "#FFB4B4" : "#FFE29A"
    }
  }, st)))))) : null);
}

// RP-02 · แปลงของฉัน
function LiffFields({
  onClose
}) {
  const fields = [["CPA1001/F01", "แปลงนาหลังบ้าน", "2.40 ไร่", "หอมปทุม", "ภาพ 2/4 ครอปนี้", "warning"], ["CPA1001/F02", "แปลงติดคลอง", "6.25 ไร่", "หอมปทุม", "ภาพครบ 4/4", "success"], ["CPA1002/F01", "แปลงเช่า", "4.02 ไร่", "หอมปทุม", "สัญญาเช่าใกล้หมดอายุ", "danger"]];
  return /*#__PURE__*/React.createElement(LiffShell, {
    title: "\u0E41\u0E1B\u0E25\u0E07\u0E02\u0E2D\u0E07\u0E09\u0E31\u0E19",
    subtitle: "3 \u0E41\u0E1B\u0E25\u0E07\u0E22\u0E48\u0E2D\u0E22 \xB7 \u0E40\u0E25\u0E37\u0E2D\u0E01\u0E41\u0E1B\u0E25\u0E07\u0E17\u0E35\u0E48\u0E08\u0E30\u0E17\u0E33\u0E07\u0E32\u0E19\u0E14\u0E49\u0E27\u0E22",
    onClose: onClose
  }, fields.map(([code, name, area, rice, st, tone]) => /*#__PURE__*/React.createElement("div", {
    key: code,
    style: {
      background: "#fff",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      padding: "12px 13px",
      display: "flex",
      flexDirection: "column",
      gap: "8px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "8px"
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "13px",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)"
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontFamily: "var(--font-mono)",
      fontSize: "10px",
      color: "var(--text-subtle)"
    }
  }, code)), /*#__PURE__*/React.createElement(Badge, {
    tone: tone
  }, st)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "6px"
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    tone: "neutral"
  }, area), /*#__PURE__*/React.createElement(Tag, {
    tone: "teal"
  }, rice)), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    fullWidth: true,
    onClick: onClose
  }, "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E41\u0E1B\u0E25\u0E07\u0E19\u0E35\u0E49"))));
}

// RP-04 · ติดต่อเจ้าหน้าที่
function LiffContact({
  onClose
}) {
  return /*#__PURE__*/React.createElement(LiffShell, {
    title: "\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D\u0E40\u0E08\u0E49\u0E32\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48",
    subtitle: "\u0E08-\u0E28 08:30-17:00",
    onClose: onClose,
    footer: /*#__PURE__*/React.createElement(Button, {
      fullWidth: true,
      onClick: onClose
    }, "\u0E04\u0E38\u0E22\u0E01\u0E31\u0E1A\u0E40\u0E08\u0E49\u0E32\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48\u0E43\u0E19\u0E41\u0E0A\u0E15")
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E2A\u0E32\u0E19\u0E07\u0E32\u0E19\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13",
    hint: "\u0E2D.\u0E2A\u0E32\u0E21\u0E0A\u0E38\u0E01 \u0E08.\u0E2A\u0E38\u0E1E\u0E23\u0E23\u0E13\u0E1A\u0E38\u0E23\u0E35"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "11px",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "42px",
      height: "42px",
      borderRadius: "var(--radius-circle)",
      background: "var(--navy-50)",
      color: "var(--navy-700)",
      display: "grid",
      placeItems: "center",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user",
    size: 19
  })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "13px",
      fontWeight: "var(--weight-semibold)"
    }
  }, "\u0E04\u0E38\u0E13\u0E27\u0E34\u0E20\u0E32 \u0E40\u0E08\u0E49\u0E32\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48\u0E20\u0E32\u0E04\u0E2A\u0E19\u0E32\u0E21"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "11px",
      color: "var(--text-subtle)"
    }
  }, "+66 (0) 63-298-4955")))), /*#__PURE__*/React.createElement(Panel, {
    title: "\u0E27\u0E34\u0E18\u0E35\u0E43\u0E0A\u0E49 LINE OA",
    hint: "\u0E27\u0E34\u0E14\u0E35\u0E42\u0E2D\u0E2A\u0E31\u0E49\u0E19 2 \u0E19\u0E32\u0E17\u0E35 \u2014 \u0E41\u0E2A\u0E14\u0E07\u0E15\u0E2D\u0E19\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E19\u0E04\u0E23\u0E31\u0E49\u0E07\u0E41\u0E23\u0E01 \u0E41\u0E25\u0E30\u0E40\u0E1B\u0E34\u0E14\u0E14\u0E39\u0E0B\u0E49\u0E33\u0E44\u0E14\u0E49\u0E17\u0E38\u0E01\u0E40\u0E21\u0E37\u0E48\u0E2D"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      borderRadius: "var(--radius-sm)",
      overflow: "hidden",
      aspectRatio: "16 / 9",
      background: "linear-gradient(150deg,#061E5C,#027276)",
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "44px",
      height: "44px",
      borderRadius: "var(--radius-circle)",
      background: "rgba(255,255,255,.92)",
      color: "var(--teal-700)",
      display: "grid",
      placeItems: "center",
      fontSize: "15px"
    }
  }, "\u25B6"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "9px",
      bottom: "8px",
      color: "#fff",
      fontSize: "11px",
      fontWeight: "var(--weight-semibold)"
    }
  }, "\u0E2A\u0E2D\u0E19\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E17\u0E35\u0E25\u0E30\u0E02\u0E31\u0E49\u0E19 \xB7 2:14")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "var(--text-subtle)",
      lineHeight: 1.6
    }
  }, "\uD83D\uDEA7 \u0E44\u0E1F\u0E25\u0E4C\u0E27\u0E34\u0E14\u0E35\u0E42\u0E2D\u0E08\u0E23\u0E34\u0E07\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E2A\u0E48\u0E07\u0E21\u0E32 \u2014 \u0E0A\u0E48\u0E2D\u0E07\u0E19\u0E35\u0E49\u0E40\u0E1B\u0E47\u0E19\u0E17\u0E35\u0E48\u0E27\u0E32\u0E07\u0E44\u0E27\u0E49 \xB7 \u0E15\u0E2D\u0E19\u0E43\u0E0A\u0E49\u0E08\u0E23\u0E34\u0E07\u0E27\u0E34\u0E14\u0E35\u0E42\u0E2D\u0E08\u0E30\u0E40\u0E25\u0E48\u0E19\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34\u0E43\u0E19\u0E01\u0E32\u0E23\u0E4C\u0E14\u0E17\u0E31\u0E01\u0E17\u0E32\u0E22\u0E15\u0E2D\u0E19\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E19 (OB-01) \u0E41\u0E25\u0E30\u0E40\u0E1B\u0E34\u0E14\u0E0B\u0E49\u0E33\u0E44\u0E14\u0E49\u0E08\u0E32\u0E01\u0E40\u0E21\u0E19\u0E39\u0E19\u0E35\u0E49")), /*#__PURE__*/React.createElement(Panel, {
    tone: "warn",
    title: "\u0E42\u0E2B\u0E21\u0E14\u0E2A\u0E31\u0E0D\u0E0D\u0E32\u0E13\u0E44\u0E21\u0E48\u0E14\u0E35 (SY-06)",
    hint: "\u0E16\u0E48\u0E32\u0E22\u0E44\u0E27\u0E49\u0E01\u0E48\u0E2D\u0E19\u0E44\u0E14\u0E49 \u0E23\u0E30\u0E1A\u0E1A\u0E40\u0E01\u0E47\u0E1A\u0E20\u0E32\u0E1E\u0E43\u0E19\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E41\u0E25\u0E49\u0E27\u0E2A\u0E48\u0E07\u0E40\u0E2D\u0E07\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E21\u0E35\u0E2A\u0E31\u0E0D\u0E0D\u0E32\u0E13"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "12px",
      color: "var(--text-body)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u0E20\u0E32\u0E1E\u0E17\u0E35\u0E48\u0E04\u0E49\u0E32\u0E07\u0E23\u0E2D\u0E2A\u0E48\u0E07"), /*#__PURE__*/React.createElement("b", null, "1 \u0E20\u0E32\u0E1E")), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    fullWidth: true
  }, "\u0E2A\u0E48\u0E07\u0E20\u0E32\u0E1E\u0E17\u0E35\u0E48\u0E04\u0E49\u0E32\u0E07\u0E2D\u0E22\u0E39\u0E48")));
}

// BL-01 ถึง BL-15 · กรอกข้อมูลย้อนหลัง 3 ปี (8 ชุด × 6 ฤดู)
function LiffBaseline({
  onClose
}) {
  const seasons = [["2566", "นาปี", "done"], ["2566", "นาปรัง", "done"], ["2567", "นาปี", "done"], ["2567", "นาปรัง", "done"], ["2568", "นาปี", "now"], ["2568", "นาปรัง", "todo"]];
  const sets = [["ข้อ 1/8", "การขังน้ำก่อนฤดูปลูก", "SF_p", "เลือก 1 จาก 4 แบบ"], ["ข้อ 2/8", "การจัดการน้ำระหว่างฤดู", "SF_w", "เลือก 1 จาก 3 แบบ"], ["ข้อ 3/8", "วัสดุอินทรีย์ที่ใส่ลงแปลง", "SF_o", "เลือกได้หลายชนิด + ปริมาณ กก./ไร่"], ["ข้อ 4/8", "ปุ๋ยอินทรีย์", "N₂O", "ปริมาณ กก./ไร่ + %N จากฉลาก"], ["ข้อ 5/8", "ปูนขาว และ โดโลไมต์", "CO₂", "กก./ไร่ อย่างละช่อง"], ["ข้อ 6/8", "ไฟฟ้าและน้ำมัน", "CO₂", "ลิตร/ไร่ และ kWh/ไร่"], ["ข้อ 7/8", "การจัดการฟางหลังเก็บเกี่ยว", "เผา / ไม่เผา", "ถ้าเผาต้องกรอกมวลฟาง"], ["ข้อ 8/8", "ปุ๋ยเคมี 3 ครั้งต่อฤดู", "N₂O + ยูเรีย", "ตารางคงที่ 3 แถว"]];
  const [open, setOpen] = React.useState(1);
  return /*#__PURE__*/React.createElement(LiffShell, {
    title: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E22\u0E49\u0E2D\u0E19\u0E2B\u0E25\u0E31\u0E07 3 \u0E1B\u0E35",
    subtitle: "BL-01 \u0E16\u0E36\u0E07 BL-15 \xB7 8 \u0E0A\u0E38\u0E14\u0E04\u0E33\u0E16\u0E32\u0E21 \xD7 6 \u0E24\u0E14\u0E39",
    onClose: onClose,
    footer: /*#__PURE__*/React.createElement(Button, {
      fullWidth: true,
      onClick: onClose
    }, "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E41\u0E25\u0E30\u0E44\u0E1B\u0E15\u0E48\u0E2D")
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "\u0E01\u0E23\u0E2D\u0E01\u0E41\u0E25\u0E49\u0E27 4 \u0E08\u0E32\u0E01 6 \u0E24\u0E14\u0E39",
    hint: "\u0E01\u0E23\u0E2D\u0E01\u0E17\u0E35\u0E25\u0E30\u0E19\u0E34\u0E14\u0E01\u0E47\u0E44\u0E14\u0E49\u0E04\u0E23\u0E31\u0E1A \u0E44\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E23\u0E35\u0E1A \xB7 \u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E33\u0E17\u0E35\u0E48\u0E01\u0E23\u0E2D\u0E01\u0E44\u0E27\u0E49\u0E43\u0E2B\u0E49"
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: 4,
    max: 6,
    valueLabel: "4/6 \u0E24\u0E14\u0E39"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "5px",
      marginTop: "4px"
    }
  }, seasons.map(([y, s2, st], i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      textAlign: "center",
      padding: "7px 4px",
      borderRadius: "var(--radius-sm)",
      fontSize: "10.5px",
      fontWeight: "var(--weight-semibold)",
      lineHeight: 1.35,
      background: st === "done" ? "var(--teal-600)" : st === "now" ? "var(--status-warning)" : "var(--white)",
      color: st === "todo" ? "var(--text-subtle)" : "#fff",
      border: "1px solid " + (st === "todo" ? "var(--border-default)" : "transparent")
    }
  }, y, /*#__PURE__*/React.createElement("br", null), s2)))), /*#__PURE__*/React.createElement(Panel, {
    tone: "warn",
    title: "\u0E17\u0E32\u0E07\u0E25\u0E31\u0E14: \u0E40\u0E2B\u0E21\u0E37\u0E2D\u0E19\u0E24\u0E14\u0E39\u0E17\u0E35\u0E48\u0E01\u0E23\u0E2D\u0E01\u0E44\u0E27\u0E49\u0E41\u0E25\u0E49\u0E27\u0E44\u0E2B\u0E21 (BL-02)",
    hint: "\u0E16\u0E49\u0E32\u0E24\u0E14\u0E39\u0E19\u0E35\u0E49\u0E17\u0E33\u0E40\u0E2B\u0E21\u0E37\u0E2D\u0E19\u0E24\u0E14\u0E39\u0E01\u0E48\u0E2D\u0E19 \u0E01\u0E14\u0E1B\u0E38\u0E48\u0E21\u0E40\u0E14\u0E35\u0E22\u0E27\u0E08\u0E1A \u0E44\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E15\u0E2D\u0E1A\u0E43\u0E2B\u0E21\u0E48\u0E17\u0E31\u0E49\u0E07 8 \u0E02\u0E49\u0E2D"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "7px"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    fullWidth: true
  }, "\u0E40\u0E2B\u0E21\u0E37\u0E2D\u0E19 2567 \u0E19\u0E32\u0E1B\u0E35"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    fullWidth: true
  }, "\u0E15\u0E2D\u0E1A\u0E43\u0E2B\u0E21\u0E48\u0E17\u0E35\u0E25\u0E30\u0E02\u0E49\u0E2D"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      letterSpacing: ".08em",
      textTransform: "uppercase",
      color: "var(--text-subtle)",
      fontWeight: 600
    }
  }, "\u0E24\u0E14\u0E39 2568 \u0E19\u0E32\u0E1B\u0E35"), sets.map(([no, name, eq, how], i) => {
    const done = i < 2,
      isOpen = open === i;
    return /*#__PURE__*/React.createElement("div", {
      key: no,
      style: {
        background: "#fff",
        border: "1px solid " + (isOpen ? "var(--border-accent)" : "var(--border-subtle)"),
        borderRadius: "var(--radius-md)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpen(isOpen ? -1 : i),
      style: {
        width: "100%",
        textAlign: "left",
        border: "none",
        background: "none",
        padding: "11px 13px",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        display: "flex",
        gap: "10px",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: "22px",
        height: "22px",
        flex: "none",
        borderRadius: "var(--radius-circle)",
        background: done ? "var(--teal-600)" : isOpen ? "var(--status-warning)" : "var(--grey-100)",
        color: done || isOpen ? "#fff" : "var(--text-subtle)",
        display: "grid",
        placeItems: "center",
        fontSize: "10px",
        fontWeight: 700
      }
    }, done ? "✓" : i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: "12.5px",
        fontWeight: "var(--weight-semibold)",
        color: "var(--text-heading)"
      }
    }, name), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: "10.5px",
        color: "var(--text-subtle)"
      }
    }, no, " \xB7 \u0E40\u0E02\u0E49\u0E32\u0E2A\u0E21\u0E01\u0E32\u0E23 ", eq)), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-subtle)",
        fontSize: "12px"
      }
    }, isOpen ? "▴" : "▾")), isOpen ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 13px 13px",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "11px",
        color: "var(--text-subtle)"
      }
    }, how), i === 1 ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "6px"
      }
    }, [["WW-1", "ขังน้ำต่อเนื่องตลอดฤดู", true], ["WW-2", "ระบายน้ำ / ปล่อยแห้ง 1 ครั้ง", false], ["WW-3", "ปล่อยแห้งหลายครั้ง / เปียกสลับแห้ง", false]].map(([c, l, on]) => /*#__PURE__*/React.createElement("span", {
      key: c,
      style: {
        display: "flex",
        gap: "9px",
        alignItems: "center",
        padding: "9px 11px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid " + (on ? "var(--teal-600)" : "var(--border-default)"),
        background: on ? "var(--teal-50)" : "#fff"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        border: "1px solid " + (on ? "var(--teal-600)" : "var(--border-default)"),
        background: on ? "var(--teal-600)" : "#fff",
        flex: "none"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "12px",
        color: "var(--text-body)"
      }
    }, l))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "10.5px",
        color: "var(--text-subtle)",
        lineHeight: 1.5
      }
    }, "\u0E02\u0E49\u0E2D\u0E19\u0E35\u0E49\u0E44\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E20\u0E32\u0E1E\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19 \u0E40\u0E1E\u0E23\u0E32\u0E30\u0E40\u0E1B\u0E47\u0E19\u0E1E\u0E24\u0E15\u0E34\u0E01\u0E23\u0E23\u0E21\u0E22\u0E49\u0E2D\u0E19\u0E2B\u0E25\u0E31\u0E07 \u2014 \u0E20\u0E32\u0E1E\u0E1A\u0E31\u0E07\u0E04\u0E31\u0E1A\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E24\u0E14\u0E39\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23")) : /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 12px",
        border: "1px dashed var(--border-default)",
        borderRadius: "var(--radius-sm)",
        fontSize: "11.5px",
        color: "var(--text-subtle)",
        textAlign: "center",
        lineHeight: 1.6
      }
    }, "\uD83D\uDEA7 \u0E22\u0E31\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E17\u0E35\u0E48\u0E27\u0E32\u0E07\u0E44\u0E27\u0E49 \u2014 \u0E1F\u0E2D\u0E23\u0E4C\u0E21\u0E02\u0E2D\u0E07\u0E02\u0E49\u0E2D\u0E19\u0E35\u0E49\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E17\u0E33", /*#__PURE__*/React.createElement("br", null), "\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E01\u0E47\u0E1A: ", how)) : null);
  }), /*#__PURE__*/React.createElement(Panel, {
    title: "\u0E01\u0E23\u0E2D\u0E01\u0E40\u0E2D\u0E07\u0E44\u0E21\u0E48\u0E44\u0E2B\u0E27?",
    hint: "\u0E40\u0E08\u0E49\u0E32\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48\u0E20\u0E32\u0E04\u0E2A\u0E19\u0E32\u0E21\u0E01\u0E23\u0E2D\u0E01\u0E41\u0E17\u0E19\u0E44\u0E14\u0E49 (BL-14) \u0E42\u0E14\u0E22\u0E43\u0E0A\u0E49\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E40\u0E08\u0E49\u0E32\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48 \u0E23\u0E30\u0E1A\u0E1A\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E44\u0E27\u0E49\u0E27\u0E48\u0E32\u0E43\u0E04\u0E23\u0E01\u0E23\u0E2D\u0E01"
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    fullWidth: true
  }, "\u0E02\u0E2D\u0E43\u0E2B\u0E49\u0E40\u0E08\u0E49\u0E32\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48\u0E01\u0E23\u0E2D\u0E01\u0E41\u0E17\u0E19")));
}
const LIFF = {
  register: LiffRegister,
  baseline: LiffBaseline,
  docs: LiffDocs,
  camera: LiffCamera,
  calendar: LiffCalendar,
  summary: LiffSummary,
  fields: LiffFields,
  contact: LiffContact
};
Object.assign(window, {
  LIFF,
  LiffShell,
  Panel
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/line_oa_farmer/LiffScreens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/line_oa_farmer/script.jsx
try { (() => {
// Farmer-facing LINE OA script. Copy is taken from the NZC chatbot spec
// (LINE_Chatbot_Flow_AWD · nodes OB-01…OB-11, PJ-00…PJ-13, RP-01…RP-04).
// Each entry is one thing that appears in the conversation, in order.

const SCRIPT = [
// ---------- ฉาก 1 · เพิ่มเพื่อน + PDPA (OB-01, OB-15) ----------
{
  ch: "ob",
  type: "divider",
  text: "เพิ่ม NetZeroCarbon เป็นเพื่อนแล้ว"
}, {
  ch: "ob",
  type: "flex",
  node: "OB-01",
  heroTone: "teal",
  hero: "โครงการทำนาลดโลกร้อน (เปียกสลับแห้ง)",
  heroBadge: "ยินดีต้อนรับ",
  title: "สวัสดีครับ 🌾 นี่คือ LINE ของ NetZeroCarbon",
  body: "ใช้ส่งภาพและกรอกข้อมูลแปลงนา เพื่อคิดคาร์บอนเครดิตให้พี่น้องเกษตรกรครับ\nใช้เวลาตอนสมัครประมาณ 10 นาที หลังจากนั้นเดือนละไม่กี่ครั้ง",
  actions: [{
    label: "ผูกบัญชีของฉัน",
    primary: true
  }]
}, {
  ch: "ob",
  type: "flex",
  node: "OB-15",
  heroTone: "navy",
  hero: "ความยินยอมเก็บและใช้ข้อมูลส่วนบุคคล",
  heroBadge: "CS-01 · PDPA",
  title: "ก่อนจะถามอะไรต่อ ขออนุญาตเรื่องข้อมูลส่วนตัวก่อนนะครับ",
  rows: [["เก็บอะไร", "ชื่อ · เพศ · เบอร์โทร · ที่อยู่ · เลขบัตร ปชช."], ["เก็บเพิ่มภายหลัง", "ตำแหน่งแปลง · ภาพถ่ายแปลงนา"], ["ใช้ทำอะไร", "ขึ้นทะเบียนและดำเนินโครงการคาร์บอนเครดิต"], ["ถอนความยินยอม", "ทำได้ทุกเมื่อ แจ้งผู้ประสานงาน"]],
  actions: [{
    label: "อ่านข้อความเต็ม"
  }, {
    label: "ยินยอม",
    primary: true
  }]
}, {
  ch: "ob",
  type: "me",
  text: "ยินยอม",
  time: "09:41",
  read: true
},
// ---------- ฉาก 2 · แชร์เบอร์ (OB-02, OB-03) ----------
{
  ch: "ob",
  type: "oa",
  node: "OB-02",
  text: "ขอเบอร์โทรศัพท์ที่ลงทะเบียนไว้กับเจ้าหน้าที่หน่อยครับ\nกดปุ่มด้านล่างเพื่อแชร์เบอร์จาก LINE ได้เลย ไม่ต้องพิมพ์",
  time: "09:41",
  quick: ["แชร์เบอร์จาก LINE", "พิมพ์เบอร์เอง"]
}, {
  ch: "ob",
  type: "me",
  text: "081-234-5678",
  time: "09:42",
  read: true
}, {
  ch: "ob",
  type: "flex",
  node: "OB-03",
  heroTone: "teal",
  hero: "พบเบอร์นี้ในทะเบียนแล้ว",
  heroBadge: "ยืนยันตัวตน",
  title: "สมชาย ใจดี",
  subtitle: "อ.สามชุก จ.สุพรรณบุรี",
  body: "ใช่ท่านหรือไม่ครับ",
  actions: [{
    label: "ไม่ใช่"
  }, {
    label: "ใช่ ผมเอง",
    primary: true
  }]
},
// ---------- ฉาก 3 · เงื่อนไข 3 ข้อ (OB-05) ----------
{
  ch: "ob",
  type: "divider",
  text: "ขั้นตอนสมัคร"
}, {
  ch: "ob",
  type: "oa",
  node: "OB-05",
  text: "ก่อนเข้าร่วมโครงการ ขอให้อ่านและติ๊กยอมรับอีก 3 ข้อครับ\nกดที่แต่ละข้อเพื่ออ่านข้อความเต็ม",
  time: "09:43"
}, {
  ch: "ob",
  type: "flex",
  node: "OB-05",
  heroTone: "navy",
  hero: "เงื่อนไขการเข้าร่วมโครงการ",
  heroBadge: "3 ข้อ",
  title: "ต้องติ๊กครบทุกข้อจึงจะไปต่อได้",
  subtitle: "ระบบเก็บวันเวลาและเวอร์ชันของข้อความไว้เป็นหลักฐาน",
  rows: [["CS-02", "การรักษาความลับข้อมูล ✓", "good"], ["CS-03", "สิทธิ์ในคาร์บอนเครดิต ✓", "good"], ["CS-04", "ภาพถ่ายและพิกัด ✓", "good"]],
  actions: [{
    label: "อ่านข้อความเต็ม"
  }, {
    label: "ยอมรับทั้ง 3 ข้อ",
    primary: true
  }]
},
// ---------- ฉาก 4 · ฟอร์มสมัคร (OB-06, OB-12) ----------
{
  ch: "ob",
  type: "oa",
  node: "OB-12",
  text: "กรอกข้อมูลของท่านและแปลงนาครับ\nกดปุ่มแล้วกรอกในหน้าจอได้เลย ตัวอักษรใหญ่ กดง่าย",
  time: "09:44",
  quick: ["ให้เจ้าหน้าที่กรอกแทน"]
}, {
  ch: "ob",
  type: "flex",
  node: "LF-01",
  heroTone: "teal",
  hero: "ข้อมูลของท่านและทะเบียนโฉนด",
  heroBadge: "1 จาก 2",
  title: "ฟอร์มสมัครเข้าร่วมโครงการ",
  subtitle: "ใช้เวลาประมาณ 5 นาทีต่อโฉนด 1 ใบ",
  rows: [["ข้อมูลคน", "R-01 ถึง R-06"], ["ข้อมูลแปลง", "R-07 ถึง R-14"], ["รหัสแปลง", "ระบบรันให้เอง"]],
  actions: [{
    label: "กรอกข้อมูล",
    primary: true,
    liff: "register"
  }]
}, {
  ch: "ob",
  type: "me",
  text: "กรอกข้อมูลเรียบร้อย",
  time: "09:50",
  read: true
},
// ---------- ฉาก 5 · เอกสารสิทธิ์ (OB-13) ----------
{
  ch: "ob",
  type: "flex",
  node: "OB-13",
  heroTone: "amber",
  hero: "เอกสารสิทธิ์ของแปลง 12345-01",
  heroBadge: "2 จาก 2",
  title: "แปลงนี้ต้องแนบเอกสาร 3 รายการครับ",
  subtitle: "ถ่ายจากของจริงได้เลย ให้เห็นครบทั้งใบนะครับ",
  rows: [["DOC-01", "โฉนดที่ดิน"], ["DOC-03", "สำเนาบัตรประชาชน"], ["DOC-06", "หนังสือมอบอำนาจ (ถ้าไม่ใช่เจ้าของ)"]],
  actions: [{
    label: "ดาวน์โหลดแบบฟอร์ม"
  }, {
    label: "ถ่ายเอกสาร",
    primary: true,
    liff: "docs"
  }]
}, {
  ch: "ob",
  type: "flex",
  node: "OB-10",
  heroTone: "grey",
  hero: "รอเจ้าหน้าที่ตรวจเอกสาร",
  heroBadge: "pending_review",
  title: "รับใบสมัครแล้วครับ ✅",
  subtitle: "สมชาย ใจดี · แปลงนาหลังบ้าน · 14.0 ไร่",
  body: "ระหว่างนี้ยังส่งภาพกิจกรรมไม่ได้ แต่กรอกข้อมูลย้อนหลังไว้ก่อนได้เลยครับ",
  actions: [{
    label: "แก้ไขใบสมัคร"
  }, {
    label: "กรอกข้อมูลย้อนหลัง",
    primary: true
  }]
}, {
  ch: "ob",
  type: "flex",
  node: "OB-11",
  heroTone: "teal",
  hero: "บัญชีของคุณเปิดใช้งานแล้ว 🎉",
  heroBadge: "active",
  title: "รหัสเกษตรกร SPB-0142",
  subtitle: "ผู้ประสานงานยืนยันตัวตนเรียบร้อย",
  rows: [["แปลง", "แปลงนาหลังบ้าน · 12345-01"], ["เนื้อที่", "14.0 ไร่"], ["ขั้นต่อไป", "แจ้งวันหว่านเพื่อเปิดฤดู"]],
  actions: [{
    label: "เริ่มใช้งาน",
    primary: true
  }]
},
// ---------- ฉาก 7 · เปิดฤดู (PJ-00, PJ-13) ----------
{
  ch: "pj",
  type: "divider",
  text: "ฤดูโครงการ · นาปี 2569 · ต้องส่งภาพ 4 รอบ"
}, {
  ch: "pj",
  type: "oa",
  node: "PJ-00",
  text: "พร้อมเริ่มปลูกฤดูนี้แล้วหรือยังครับ 🌾\nถ้าหว่านแล้ว บอกวันที่หว่านให้หน่อย ระบบจะกางตารางกิจกรรมทั้งฤดูให้เอง\n(วันหว่านคือวันที่ 0 ของทุกกิจกรรม)",
  time: "06:12",
  quick: ["หว่านแล้ว เลือกวันที่", "ยังไม่ได้หว่าน", "ปีนี้ไม่ได้ปลูกแปลงนี้"]
}, {
  ch: "pj",
  type: "me",
  text: "1 ก.ค. 2569",
  time: "06:13",
  read: true
}, {
  ch: "pj",
  type: "flex",
  node: "PJ-13",
  heroTone: "teal",
  hero: "ปฏิทินฤดูนี้ 9 ขั้นตอน",
  heroBadge: "SG-01 ถึง SG-09",
  title: "ฤดูนี้มี 9 ขั้นตอนที่ต้องบันทึกครับ",
  subtitle: "ขั้นที่ยังไม่ถึงกำหนดจะกดบันทึกไม่ได้",
  rows: [["✅ SG-01 · SG-02", "เตรียมแปลง · หว่าน 1 ก.ค.", "good"], ["✅ SG-03", "ใส่ปุ๋ยครั้งที่ 1", "good"], ["📷 SG-04", "ภาพรอบที่ 1 เปียก — วันที่ 28", "warn"], ["📷 SG-05", "ภาพรอบที่ 1 แห้ง — วันที่ 42"], ["📷 SG-07", "ภาพรอบที่ 2 เปียก — วันที่ 61"], ["📷 SG-08", "ภาพรอบที่ 2 แห้ง — วันที่ 75"]],
  actions: [{
    label: "ดูทั้งปฏิทิน",
    liff: "calendar"
  }, {
    label: "บันทึกขั้นนี้",
    primary: true
  }]
},
// ---------- ฉาก 8 · ภาพหลักฐาน (PJ-02, PJ-03, PJ-04, PJ-06) ----------
{
  ch: "pj",
  type: "divider",
  text: "วันที่ 28 หลังหว่าน · ภาพรอบที่ 1 (เปียก)"
}, {
  ch: "pj",
  type: "flex",
  node: "PJ-02",
  heroTone: "navy",
  hero: "รอบที่ 1 · ช่วงเปียก",
  heroBadge: "WET-1 · SG-04",
  title: "ถึงเวลารายงานแล้วครับ 🌾",
  subtitle: "แปลงนาหลังบ้าน · วันที่ 28 หลังหว่าน",
  rows: [["ส่งได้ถึง", "8 ส.ค. · เหลือ 2 วัน", "warn"], ["สิ่งที่ต้องส่ง", "ภาพท่อ PVC ตอนน้ำเต็มระดับผิวดิน"], ["ครอปนี้ต้องส่งทั้งหมด", "4 ภาพ — เปียก 2 แห้ง 2 สลับกัน"]],
  actions: [{
    label: "ยังไม่ได้ทำ"
  }, {
    label: "ถ่ายภาพส่งเลย",
    primary: true,
    liff: "camera"
  }]
}, {
  ch: "pj",
  type: "oa",
  node: "PJ-03",
  text: "รอบนี้เป็นช่วงเปียกครับ ถ่ายให้เห็นท่อ PVC ตอนน้ำเต็มระดับผิวดิน ยืนห่างประมาณ 1 เมตร\n(ระบบจะจับพิกัดและเวลาให้อัตโนมัติ ต้องเปิด GPS)",
  time: "07:12"
}, {
  ch: "pj",
  type: "photo",
  gps: "14.9231, 100.1042 · 07:13",
  caption: "WET-1",
  time: "07:13"
}, {
  ch: "pj",
  type: "me",
  text: "0 ซม. (น้ำเต็ม)",
  time: "07:14",
  read: true
}, {
  ch: "pj",
  type: "oa",
  node: "PJ-07",
  text: "รับภาพรอบที่ 1 (เปียก) แล้วครับ ✅ เหลืออีก 3 ภาพในครอปนี้\nรอบถัดไปคือช่วงแห้ง ระบบจะเตือนให้เองครับ",
  time: "07:14"
}, {
  ch: "pj",
  type: "divider",
  text: "วันที่ 42 หลังหว่าน · ภาพรอบที่ 1 (แห้ง)"
}, {
  ch: "pj",
  type: "flex",
  node: "PJ-02",
  heroTone: "amber",
  hero: "รอบที่ 1 · ช่วงแห้ง",
  heroBadge: "DRY-1 · SG-05",
  title: "ปล่อยน้ำแห้งรอบแรกได้แล้วครับ",
  subtitle: "แปลงนาหลังบ้าน · วันที่ 42 หลังหว่าน",
  rows: [["ส่งได้ถึง", "22 ส.ค. · เหลือ 3 วัน", "warn"], ["สิ่งที่ต้องส่ง", "ภาพท่อ + ระดับน้ำต่ำกว่าผิวดิน (ซม.)"], ["ส่งแล้ว", "1 จาก 4 ภาพ"]],
  actions: [{
    label: "ขอดูวิธีถ่าย"
  }, {
    label: "ถ่ายภาพส่งเลย",
    primary: true,
    liff: "camera"
  }]
}, {
  ch: "pj",
  type: "photo",
  gps: "14.9231, 100.1042 · 07:41",
  caption: "DRY-1",
  time: "07:41"
}, {
  ch: "pj",
  type: "oa",
  node: "PJ-04",
  text: "น้ำในท่ออยู่ต่ำกว่าผิวดินกี่เซนติเมตรครับ (อ่านจากขีดบนท่อ)",
  time: "07:41",
  quick: ["0 ซม. (น้ำเต็ม)", "5 ซม.", "10 ซม.", "15 ซม.", "ลึกกว่า 15 ซม.", "พิมพ์เอง"]
}, {
  ch: "pj",
  type: "me",
  text: "10 ซม.",
  time: "07:42",
  read: true
}, {
  ch: "pj",
  type: "flex",
  node: "PJ-06",
  heroTone: "grey",
  hero: "ตรวจดูอีกครั้งนะครับ",
  heroBadge: "ก่อนส่ง",
  title: "แปลงนาหลังบ้าน · DRY-1 (SG-05)",
  subtitle: "19 ส.ค. 2569 · 07:41",
  rows: [["ภาพ", "1 ใบ · มีพิกัดและเวลา", "good"], ["ระดับน้ำในท่อ", "10 ซม. ต่ำกว่าผิวดิน"], ["ความคืบหน้าครอปนี้", "2 จาก 4 ภาพ", "warn"]],
  actions: [{
    label: "ถ่ายภาพใหม่"
  }, {
    label: "ส่งข้อมูล",
    primary: true
  }]
}, {
  ch: "pj",
  type: "flex",
  node: "PJ-08",
  heroTone: "teal",
  hero: "ภาพผ่านการตรวจแล้ว ✅",
  heroBadge: "DRY-1",
  title: "ครอปนี้ส่งแล้ว 2 จาก 4 ภาพ",
  subtitle: "ตรวจโดยเจ้าหน้าที่ · 20 ส.ค. 2569",
  rows: [["✅ รอบที่ 1 เปียก", "อนุมัติ", "good"], ["✅ รอบที่ 1 แห้ง", "อนุมัติ", "good"], ["○ รอบที่ 2 เปียก", "วันที่ 61"], ["○ รอบที่ 2 แห้ง", "วันที่ 75"]],
  actions: [{
    label: "ดูสรุปแปลง",
    primary: true,
    liff: "summary"
  }]
},
// ---------- ฉาก 9 · ภาพถูกตีกลับ (PJ-09) + กันภาพจากแชท (SY-03) ----------
{
  ch: "pj",
  type: "divider",
  text: "วันที่ 61 หลังหว่าน · ภาพรอบที่ 2 (เปียก)"
}, {
  ch: "pj",
  type: "me",
  text: "[ส่งรูปจากคลังภาพ]",
  time: "08:02",
  read: true
}, {
  ch: "pj",
  type: "oa",
  node: "SY-03",
  text: "ภาพที่ส่งทางแชตใช้เป็นหลักฐานไม่ได้ครับ (ระบบจะไม่เห็นพิกัดและเวลาถ่าย)\nกดปุ่มนี้เพื่อถ่ายผ่านหน้ากล้องของระบบแทนนะครับ",
  time: "08:02",
  quick: ["ถ่ายผ่านระบบ"]
}, {
  ch: "pj",
  type: "photo",
  gps: "14.9230, 100.1043 · 08:05",
  caption: "WET-2",
  time: "08:05"
}, {
  ch: "pj",
  type: "flex",
  node: "PJ-09",
  heroTone: "amber",
  hero: "ภาพยังใช้ไม่ได้ครับ",
  heroBadge: "WET-2 · ตีกลับ",
  title: "เหตุผล: รอบนี้เป็นช่วงเปียก แต่ในภาพน้ำแห้งแล้ว",
  subtitle: "ช่วยเอาน้ำเข้าแปลงแล้วถ่ายใหม่ภายในวันที่ 14 ก.ย. นะครับ",
  rows: [["รอบที่แจ้ง", "รอบที่ 2 · เปียก"], ["สิ่งที่เห็นในภาพ", "น้ำต่ำกว่าผิวดิน", "warn"]],
  actions: [{
    label: "สอบถามเจ้าหน้าที่"
  }, {
    label: "ถ่ายใหม่",
    primary: true,
    liff: "camera"
  }]
}, {
  ch: "pj",
  type: "photo",
  gps: "14.9230, 100.1043 · 06:48",
  caption: "WET-2",
  time: "06:48"
}, {
  ch: "pj",
  type: "oa",
  node: "PJ-07",
  text: "รับข้อมูลแล้วครับ ✅ เจ้าหน้าที่จะตรวจภายใน 1-2 วันทำการ\nเหลืออีก 1 ภาพ (รอบที่ 2 แห้ง) ก็ครบครอปนี้แล้วครับ",
  time: "06:48"
},
// ---------- ฉาก 10 · งานค้างและสรุป (RP-01, RP-03) ----------
{
  ch: "rp",
  type: "divider",
  text: "งานที่ต้องทำ"
}, {
  ch: "rp",
  type: "flex",
  node: "RP-01",
  heroTone: "navy",
  hero: "งานค้างของคุณ",
  heroBadge: "TODO",
  title: "เหลือ 3 เรื่องที่ต้องทำครับ",
  rows: [["ภาพที่ต้องถ่ายใหม่", "0 รายการ", "good"], ["ภาพที่ยังไม่ส่งในครอปนี้", "1 ภาพ · รอบที่ 2 แห้ง (วันที่ 75)", "warn"], ["ฤดูย้อนหลังที่ยังไม่กรอก", "2 ฤดู", "warn"]],
  actions: [{
    label: "กรอกย้อนหลัง"
  }, {
    label: "บันทึกกิจกรรม",
    primary: true
  }]
}, {
  ch: "rp",
  type: "flex",
  node: "RP-03",
  heroTone: "teal",
  hero: "สรุปผลของฉัน",
  heroBadge: "นาปี 2569",
  title: "แปลงนาหลังบ้าน · 14.0 ไร่",
  rows: [["ภาพหลักฐานครอปนี้", "3/4 ภาพ", "warn"], ["ข้อมูลย้อนหลัง", "4/6 ฤดู", "warn"], ["คาร์บอนที่ลดได้ (ประมาณการ)", "9.42 tCO₂eq"], ["น้ำที่ประหยัดได้", "ลดลงประมาณ 43%"]],
  actions: [{
    label: "ดูประวัติการส่ง"
  }, {
    label: "เปิดแดชบอร์ดของฉัน",
    primary: true,
    liff: "summary"
  }]
}];
const CHAPTERS = {
  ob: "สมัครและผูกบัญชี",
  pj: "รายงานระหว่างฤดู",
  rp: "ดูผล / งานค้าง"
};
const RICH_MENU = [{
  glyph: "📋",
  label: "กรอกข้อมูลย้อนหลัง",
  action: "BL_HOME",
  ch: "ob"
}, {
  glyph: "📷",
  label: "บันทึกงานในแปลง",
  action: "SEASON_HOME",
  ch: "pj"
}, {
  glyph: "🔔",
  label: "งานที่ต้องทำ",
  action: "TODO",
  ch: "rp"
}, {
  glyph: "🌾",
  label: "แปลงของฉัน",
  action: "FIELD_LIST",
  liff: "fields"
}, {
  glyph: "📊",
  label: "สรุปผลของฉัน",
  action: "SUMMARY",
  liff: "summary"
}, {
  glyph: "☎️",
  label: "ติดต่อเจ้าหน้าที่",
  action: "CONTACT",
  liff: "contact"
}];
Object.assign(window, {
  SCRIPT,
  CHAPTERS,
  RICH_MENU
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/line_oa_farmer/script.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sponsor_portal/SponsorScreens.jsx
try { (() => {
const {
  Button,
  Badge,
  Tag,
  Icon,
  StatTile,
  FilterBar,
  DataTable,
  ProgressBar,
  GradientRule
} = window.NetZeroCarbonDesignSystem_f3e7a8;
const f3 = (n, d = 2) => Number(n).toLocaleString(undefined, {
  minimumFractionDigits: d,
  maximumFractionDigits: d
});
const ME = SPONSORS[0]; // บัญชีตัวอย่าง: SCBX — แอดมินให้สิทธิ์เห็นเฉพาะ ต.หนองสะเดา จ.สุพรรณบุรี
const MY_PROVINCES = PROVINCES.filter(p => ME.areas.includes(p.name));
const MY_FARMERS = FARMERS.filter(f => ME.areas.includes(f.prov));
const MY_PLOTS = MY_FARMERS.reduce((a, f) => a.concat(f.plots.map(p => ({
  ...p,
  cpa: f.code
}))), []);
const VERIFIED = SEASONS.reduce((s, x) => s + x.verified, 0);
const ESTIMATE = GHG_2569.er;
function SponsorOverview({
  filters,
  onFilter,
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(PageTitle, {
    eyebrow: "Sponsor Portal",
    title: "\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E41\u0E25\u0E30\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E17\u0E35\u0E48\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17\u0E02\u0E2D\u0E07\u0E17\u0E48\u0E32\u0E19\u0E2A\u0E19\u0E31\u0E1A\u0E2A\u0E19\u0E38\u0E19",
    sub: "โครงการทำนาลดโลกร้อน · ต.หนองสะเดา อ.สามชุก จ.สุพรรณบุรี · ระเบียบวิธี T-VER-P-METH-13-08 ฉบับที่ 01",
    actions: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "download",
        size: 15
      }),
      onClick: () => onNavigate("reports")
    }, "\u0E14\u0E32\u0E27\u0E19\u0E4C\u0E42\u0E2B\u0E25\u0E14\u0E2A\u0E23\u0E38\u0E1B")
  }), /*#__PURE__*/React.createElement(FilterBar, {
    filters: filters,
    onChange: onFilter
  }), /*#__PURE__*/React.createElement(PdpaNote, null, "\u0E21\u0E38\u0E21\u0E21\u0E2D\u0E07\u0E19\u0E35\u0E49\u0E41\u0E2A\u0E14\u0E07\u0E1C\u0E25\u0E23\u0E27\u0E21\u0E23\u0E32\u0E22\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E41\u0E25\u0E30\u0E23\u0E32\u0E22\u0E41\u0E1B\u0E25\u0E07\u0E17\u0E35\u0E48\u0E23\u0E30\u0E1A\u0E38\u0E14\u0E49\u0E27\u0E22 CPA code \u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19 \u2014 \u0E44\u0E21\u0E48\u0E41\u0E2A\u0E14\u0E07\u0E0A\u0E37\u0E48\u0E2D \u0E40\u0E1A\u0E2D\u0E23\u0E4C\u0E42\u0E17\u0E23 \u0E40\u0E25\u0E02\u0E1A\u0E31\u0E15\u0E23\u0E1B\u0E23\u0E30\u0E0A\u0E32\u0E0A\u0E19 \u0E2B\u0E23\u0E37\u0E2D\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48\u0E42\u0E09\u0E19\u0E14 \u0E41\u0E25\u0E30\u0E40\u0E08\u0E32\u0E30\u0E14\u0E39\u0E23\u0E32\u0E22\u0E1A\u0E38\u0E04\u0E04\u0E25\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49 \u0E15\u0E32\u0E21\u0E02\u0E49\u0E2D\u0E15\u0E01\u0E25\u0E07\u0E04\u0E27\u0E32\u0E21\u0E22\u0E34\u0E19\u0E22\u0E2D\u0E21 CS-02 \xB7 \u0E17\u0E48\u0E32\u0E19\u0E40\u0E2B\u0E47\u0E19\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E17\u0E35\u0E48\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17\u0E02\u0E2D\u0E07\u0E17\u0E48\u0E32\u0E19\u0E2A\u0E19\u0E31\u0E1A\u0E2A\u0E19\u0E38\u0E19 \u0E44\u0E21\u0E48\u0E40\u0E2B\u0E47\u0E19\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E02\u0E2D\u0E07\u0E1C\u0E39\u0E49\u0E2A\u0E19\u0E31\u0E1A\u0E2A\u0E19\u0E38\u0E19\u0E23\u0E32\u0E22\u0E2D\u0E37\u0E48\u0E19"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.35fr 1fr 1fr",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--gradient-deep)",
      color: "#fff",
      borderRadius: "var(--radius-card)",
      padding: "var(--space-6)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--teal-300)"
    }
  }, "\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E17\u0E35\u0E48\u0E23\u0E31\u0E1A\u0E23\u0E2D\u0E07\u0E41\u0E25\u0E49\u0E27 (\u0E17\u0E27\u0E19\u0E2A\u0E2D\u0E1A\u0E41\u0E25\u0E30\u0E2D\u0E2D\u0E01\u0E43\u0E1A\u0E23\u0E31\u0E1A\u0E23\u0E2D\u0E07)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-5xl)",
      fontWeight: "var(--weight-light)",
      lineHeight: 1,
      letterSpacing: "var(--tracking-display)"
    }
  }, f3(VERIFIED)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-md)",
      opacity: .82
    }
  }, "tCO\u2082eq")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Badge, {
    tone: "success"
  }, "\u0E23\u0E2D\u0E1A 2568 (\u0E19\u0E32\u0E1B\u0E35 + \u0E19\u0E32\u0E1B\u0E23\u0E31\u0E07) \xB7 \u0E2D\u0E2D\u0E01\u0E43\u0E1A\u0E23\u0E31\u0E1A\u0E23\u0E2D\u0E07\u0E04\u0E23\u0E1A\u0E41\u0E25\u0E49\u0E27")), /*#__PURE__*/React.createElement(GradientRule, {
    width: "100%",
    thickness: 2
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xs)",
      lineHeight: "var(--leading-relaxed)",
      color: "rgba(255,255,255,.74)"
    }
  }, "\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E01\u0E32\u0E23\u0E1B\u0E35 2569 \u0E2D\u0E35\u0E01 ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "#fff"
    }
  }, f3(ESTIMATE), " tCO\u2082eq"), " (BE ", f3(GHG_2569.be), " \u2212 PE ", f3(GHG_2569.pe), " \u0E41\u0E25\u0E49\u0E27\u0E2B\u0E31\u0E01 U_d 15%) \u2014 \u0E22\u0E31\u0E07\u0E08\u0E31\u0E14\u0E2A\u0E23\u0E23\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E08\u0E19\u0E01\u0E27\u0E48\u0E32\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E20\u0E32\u0E22\u0E19\u0E2D\u0E01\u0E08\u0E30\u0E17\u0E27\u0E19\u0E2A\u0E2D\u0E1A\u0E41\u0E25\u0E30 \u0E2D\u0E1A\u0E01. \u0E2D\u0E2D\u0E01\u0E43\u0E1A\u0E23\u0E31\u0E1A\u0E23\u0E2D\u0E07")), /*#__PURE__*/React.createElement(StatTile, {
    label: "\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E17\u0E35\u0E48\u0E2A\u0E19\u0E31\u0E1A\u0E2A\u0E19\u0E38\u0E19",
    value: f3(ME.rai, 1),
    unit: "\u0E44\u0E23\u0E48",
    note: f3(ME.rai * 0.16, 1) + " เฮกตาร์ · " + MY_PLOTS.length + " แปลงย่อย · รอบปลูก 120 วัน · 2 ฤดูต่อปี"
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "\u0E04\u0E23\u0E31\u0E27\u0E40\u0E23\u0E37\u0E2D\u0E19\u0E17\u0E35\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E1B\u0E23\u0E30\u0E42\u0E22\u0E0A\u0E19\u0E4C",
    value: MY_FARMERS.length,
    unit: "\u0E04\u0E23\u0E31\u0E27\u0E40\u0E23\u0E37\u0E2D\u0E19",
    note: "นับตาม CPA code ของผู้ถือเอกสารสิทธิ์ที่เข้าร่วม · พันธุ์ข้าวหอมปทุม และ กข85"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.15fr 1fr",
      gap: "var(--space-6)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(Section, {
    title: "\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E23\u0E32\u0E22\u0E24\u0E14\u0E39\u0E02\u0E2D\u0E07\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E17\u0E48\u0E32\u0E19",
    sub: "\u0E2B\u0E19\u0E48\u0E27\u0E22 tCO\u2082eq \xB7 \u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E01\u0E32\u0E23\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E01\u0E31\u0E1A\u0E17\u0E35\u0E48\u0E23\u0E31\u0E1A\u0E23\u0E2D\u0E07\u0E41\u0E25\u0E49\u0E27"
  }, /*#__PURE__*/React.createElement(CreditChart, {
    seasons: SEASONS,
    showBaseline: false
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-5)",
      padding: "var(--space-4)",
      background: "var(--surface-accent-soft)",
      borderRadius: "var(--radius-md)",
      fontSize: "var(--text-xs)",
      lineHeight: "var(--leading-relaxed)",
      color: "var(--teal-800)"
    }
  }, /*#__PURE__*/React.createElement("b", null, "\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E01\u0E32\u0E23"), " \u0E04\u0E33\u0E19\u0E27\u0E13\u0E08\u0E32\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E41\u0E25\u0E30\u0E20\u0E32\u0E1E\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E17\u0E35\u0E48\u0E1C\u0E48\u0E32\u0E19\u0E01\u0E32\u0E23\u0E15\u0E23\u0E27\u0E08\u0E41\u0E25\u0E49\u0E27 \u0E15\u0E32\u0E21\u0E2A\u0E21\u0E01\u0E32\u0E23\u0E02\u0E2D\u0E07\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E1A\u0E27\u0E34\u0E18\u0E35 \u0E41\u0E15\u0E48\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E1C\u0E48\u0E32\u0E19\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E20\u0E32\u0E22\u0E19\u0E2D\u0E01 \xB7 ", /*#__PURE__*/React.createElement("b", null, "\u0E23\u0E31\u0E1A\u0E23\u0E2D\u0E07\u0E41\u0E25\u0E49\u0E27"), " \u0E04\u0E37\u0E2D\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E17\u0E35\u0E48 \u0E2D\u0E1A\u0E01. \u0E2D\u0E2D\u0E01\u0E43\u0E2B\u0E49\u0E2B\u0E25\u0E31\u0E07\u0E01\u0E32\u0E23\u0E17\u0E27\u0E19\u0E2A\u0E2D\u0E1A \xB7 \u0E15\u0E31\u0E27\u0E40\u0E25\u0E02\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E01\u0E32\u0E23\u0E2D\u0E32\u0E08\u0E25\u0E14\u0E25\u0E07\u0E44\u0E14\u0E49\u0E16\u0E49\u0E32\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E20\u0E32\u0E1E\u0E44\u0E21\u0E48\u0E04\u0E23\u0E1A 4 \u0E23\u0E2D\u0E1A \u0E40\u0E1E\u0E23\u0E32\u0E30\u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E30\u0E16\u0E2D\u0E22\u0E44\u0E1B\u0E43\u0E0A\u0E49\u0E15\u0E31\u0E27\u0E1B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E19\u0E49\u0E33\u0E17\u0E35\u0E48\u0E2D\u0E19\u0E38\u0E23\u0E31\u0E01\u0E29\u0E4C\u0E19\u0E34\u0E22\u0E21\u0E01\u0E27\u0E48\u0E32")), /*#__PURE__*/React.createElement(Section, {
    title: "\u0E17\u0E35\u0E48\u0E21\u0E32\u0E02\u0E2D\u0E07\u0E2A\u0E48\u0E27\u0E19\u0E15\u0E48\u0E32\u0E07 \xB7 \u0E1B\u0E35 2569",
    sub: "\u0E2A\u0E48\u0E27\u0E19\u0E15\u0E48\u0E32\u0E07\u0E40\u0E01\u0E37\u0E2D\u0E1A\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14\u0E21\u0E32\u0E08\u0E32\u0E01\u0E21\u0E35\u0E40\u0E17\u0E19 \u2014 \u0E1B\u0E38\u0E4B\u0E22\u0E40\u0E17\u0E48\u0E32\u0E01\u0E31\u0E19\u0E17\u0E31\u0E49\u0E07\u0E2A\u0E2D\u0E07\u0E1D\u0E31\u0E48\u0E07\u0E42\u0E14\u0E22\u0E40\u0E08\u0E15\u0E19\u0E32",
    pad: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    columns: [{
      key: "name",
      label: "แหล่งการปล่อย"
    }, {
      key: "be",
      label: "กรณีฐาน",
      align: "right",
      render: r => f3(r.s1[0] + r.s2[0])
    }, {
      key: "pe",
      label: "โครงการ",
      align: "right",
      render: r => f3(r.s1[1] + r.s2[1])
    }, {
      key: "d",
      label: "ส่วนต่าง",
      align: "right",
      render: r => {
        const d = r.s1[0] + r.s2[0] - (r.s1[1] + r.s2[1]);
        return /*#__PURE__*/React.createElement("b", {
          style: {
            color: d > 0 ? "var(--status-success)" : d < 0 ? "var(--status-danger)" : "var(--text-subtle)"
          }
        }, d > 0 ? "−" : d < 0 ? "+" : "", f3(Math.abs(d)));
      }
    }],
    rows: GHG_2569.rows
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-4) var(--space-6)",
      borderTop: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      gap: "8px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)"
    }
  }, "\u0E04\u0E27\u0E32\u0E21\u0E04\u0E37\u0E1A\u0E2B\u0E19\u0E49\u0E32\u0E24\u0E14\u0E39\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19"), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "\u0E41\u0E1B\u0E25\u0E07\u0E17\u0E35\u0E48\u0E41\u0E08\u0E49\u0E07\u0E27\u0E31\u0E19\u0E2B\u0E27\u0E48\u0E32\u0E19",
    value: MY_PLOTS.length - 1,
    max: MY_PLOTS.length,
    valueLabel: MY_PLOTS.length - 1 + "/" + MY_PLOTS.length
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "\u0E20\u0E32\u0E1E\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19 4 \u0E23\u0E2D\u0E1A/\u0E04\u0E23\u0E2D\u0E1B",
    value: MY_FARMERS.reduce((s, f) => s + f.photos, 0),
    max: MY_FARMERS.reduce((s, f) => s + f.need, 0),
    valueLabel: MY_FARMERS.reduce((s, f) => s + f.photos, 0) + "/" + MY_FARMERS.reduce((s, f) => s + f.need, 0),
    tone: "mint"
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1B\u0E31\u0E08\u0E08\u0E31\u0E22\u0E01\u0E32\u0E23\u0E1C\u0E25\u0E34\u0E15\u0E04\u0E23\u0E1A",
    value: 54,
    max: 100,
    valueLabel: "54%",
    tone: "navy"
  })))), /*#__PURE__*/React.createElement(Section, {
    title: "\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C\u0E23\u0E48\u0E27\u0E21\u0E02\u0E2D\u0E07\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E17\u0E35\u0E48\u0E17\u0E48\u0E32\u0E19\u0E2A\u0E19\u0E31\u0E1A\u0E2A\u0E19\u0E38\u0E19",
    sub: "\u0E04\u0E48\u0E32\u0E40\u0E09\u0E25\u0E35\u0E48\u0E22\u0E16\u0E48\u0E27\u0E07\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E15\u0E32\u0E21\u0E40\u0E19\u0E37\u0E49\u0E2D\u0E17\u0E35\u0E48 \xB7 \u0E40\u0E17\u0E35\u0E22\u0E1A\u0E01\u0E31\u0E1A\u0E01\u0E23\u0E13\u0E35\u0E10\u0E32\u0E19\u0E22\u0E49\u0E2D\u0E19\u0E2B\u0E25\u0E31\u0E07 3 \u0E1B\u0E35"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "var(--space-6)"
    }
  }, [["ลดมีเทนจากนาข้าว", "69.6%", "896.25 → 272.02 tCO₂eq · ตัวปรับ SF_w ลดจาก 1.00 เหลือ 0.55"], ["ลดการใช้น้ำ", "43%", "เทียบกับการขังน้ำต่อเนื่องตลอดฤดู"], ["เชื้อเพลิงที่เพิ่มขึ้น", "+26.0", "tCO₂eq จากการสูบน้ำเข้า-ออกตามรอบเปียกสลับแห้ง (E-17)"], ["ปริมาณปุ๋ย", "ไม่เปลี่ยน", "โครงการไม่ขอให้เกษตรกรลดปุ๋ย — ยอดปุ๋ยฝั่งกรณีฐานและโครงการเท่ากัน"]].map(([t, v, n]) => /*#__PURE__*/React.createElement("div", {
    key: t
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-3xl)",
      fontWeight: "var(--weight-light)",
      color: t === "เชื้อเพลิงที่เพิ่มขึ้น" ? "var(--status-warning)" : "var(--text-accent)",
      lineHeight: 1.1
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)",
      marginTop: "var(--space-2)"
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "var(--text-subtle)",
      marginTop: "3px",
      lineHeight: "var(--leading-relaxed)"
    }
  }, n))))));
}
function SponsorAreas() {
  const rows = MY_PLOTS.map(p => {
    const c = computePlotSeason(p);
    return {
      cpa: p.cpa,
      plot: p.plot,
      rai: p.rai,
      rice: p.rice,
      photos: p.photosApproved,
      sfw: c.sfWpj,
      er: c.er
    };
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(PageTitle, {
    eyebrow: "\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E02\u0E2D\u0E07\u0E17\u0E48\u0E32\u0E19",
    title: "\u0E23\u0E32\u0E22\u0E41\u0E1B\u0E25\u0E07\u0E22\u0E48\u0E2D\u0E22\u0E43\u0E19\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E17\u0E35\u0E48\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17\u0E02\u0E2D\u0E07\u0E17\u0E48\u0E32\u0E19\u0E2A\u0E19\u0E31\u0E1A\u0E2A\u0E19\u0E38\u0E19",
    sub: "\u0E23\u0E30\u0E1A\u0E38\u0E14\u0E49\u0E27\u0E22 CPA code \u0E41\u0E25\u0E30\u0E23\u0E2B\u0E31\u0E2A\u0E41\u0E1B\u0E25\u0E07\u0E22\u0E48\u0E2D\u0E22\u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19 \xB7 \u0E44\u0E21\u0E48\u0E21\u0E35\u0E0A\u0E37\u0E48\u0E2D \u0E44\u0E21\u0E48\u0E21\u0E35\u0E40\u0E25\u0E02\u0E42\u0E09\u0E19\u0E14"
  }), /*#__PURE__*/React.createElement(PdpaNote, null, "CPA code (\u0E40\u0E0A\u0E48\u0E19 CPA1001) \u0E41\u0E25\u0E30\u0E23\u0E2B\u0E31\u0E2A\u0E41\u0E1B\u0E25\u0E07\u0E22\u0E48\u0E2D\u0E22 (CPA1001/F01) \u0E40\u0E1B\u0E47\u0E19\u0E15\u0E31\u0E27\u0E23\u0E30\u0E1A\u0E38\u0E17\u0E35\u0E48\u0E43\u0E0A\u0E49\u0E43\u0E19\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E17\u0E38\u0E01\u0E09\u0E1A\u0E31\u0E1A \u0E23\u0E27\u0E21\u0E16\u0E36\u0E07\u0E44\u0E1F\u0E25\u0E4C\u0E04\u0E33\u0E19\u0E27\u0E13\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E17\u0E35\u0E48\u0E22\u0E37\u0E48\u0E19 \u0E2D\u0E1A\u0E01. \u2014 \u0E17\u0E33\u0E43\u0E2B\u0E49\u0E15\u0E23\u0E27\u0E08\u0E22\u0E49\u0E2D\u0E19\u0E01\u0E25\u0E31\u0E1A\u0E44\u0E14\u0E49\u0E42\u0E14\u0E22\u0E44\u0E21\u0E48\u0E40\u0E1B\u0E34\u0E14\u0E40\u0E1C\u0E22\u0E15\u0E31\u0E27\u0E1A\u0E38\u0E04\u0E04\u0E25"), MY_PROVINCES.map(p => /*#__PURE__*/React.createElement(Section, {
    key: p.name,
    title: p.name,
    sub: p.note + " · " + p.households + " ครัวเรือน · " + f3(p.rai, 1) + " ไร่ · ER " + f3(p.credits) + " tCO₂eq",
    pad: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    columns: [{
      key: "cpa",
      label: "CPA code",
      render: r => /*#__PURE__*/React.createElement("b", {
        style: {
          fontFamily: "var(--font-mono)",
          fontSize: "12px"
        }
      }, r.cpa)
    }, {
      key: "plot",
      label: "แปลงย่อย",
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)",
          fontSize: "11.5px"
        }
      }, r.plot)
    }, {
      key: "rai",
      label: "ไร่",
      align: "right",
      render: r => f3(r.rai, 2)
    }, {
      key: "rice",
      label: "พันธุ์ข้าว"
    }, {
      key: "photos",
      label: "ภาพหลักฐาน",
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          display: "flex",
          gap: "4px"
        }
      }, PHOTO_ROUNDS.map((pr, i) => /*#__PURE__*/React.createElement("span", {
        key: pr.code,
        title: pr.name,
        style: {
          width: "24px",
          height: "18px",
          borderRadius: "3px",
          display: "grid",
          placeItems: "center",
          fontSize: "9px",
          fontWeight: 700,
          background: i < r.photos ? pr.phase === "wet" ? "var(--navy-600)" : "var(--teal-600)" : "var(--grey-200)",
          color: i < r.photos ? "#fff" : "var(--grey-500)"
        }
      }, pr.phase === "wet" ? "เปียก" : "แห้ง")))
    }, {
      key: "sfw",
      label: "ตัวปรับการจัดการน้ำ",
      align: "right",
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)"
        }
      }, r.sfw.v.toFixed(2), r.sfw.fallback ? " ⚠" : "")
    }, {
      key: "er",
      label: "ER (tCO₂eq)",
      align: "right",
      render: r => f3(r.er, 3)
    }],
    rows: rows
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "\u0E20\u0E32\u0E1E\u0E16\u0E48\u0E32\u0E22\u0E41\u0E1B\u0E25\u0E07\u0E08\u0E32\u0E01\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E02\u0E2D\u0E07\u0E17\u0E48\u0E32\u0E19",
    sub: "CU-02 \xB7 \u0E1C\u0E39\u0E01\u0E20\u0E32\u0E1E\u0E16\u0E48\u0E32\u0E22\u0E41\u0E1B\u0E25\u0E07\u0E40\u0E02\u0E49\u0E32\u0E01\u0E31\u0E1A\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15 \xB7 \u0E20\u0E32\u0E1E\u0E44\u0E21\u0E48\u0E23\u0E30\u0E1A\u0E38\u0E15\u0E31\u0E27\u0E1A\u0E38\u0E04\u0E04\u0E25"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "var(--space-3)"
    }
  }, PHOTO_ROUNDS.map(pr => /*#__PURE__*/React.createElement("div", {
    key: pr.code,
    style: {
      borderRadius: "var(--radius-sm)",
      overflow: "hidden",
      border: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      aspectRatio: "4 / 3",
      background: "linear-gradient(180deg,#9FC7E8,#8FA95C)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: "50%",
      top: "22%",
      transform: "translateX(-50%)",
      width: "16px",
      height: "54px",
      background: "#E7EDF2",
      borderRadius: "2px",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: pr.phase === "wet" ? "6% 0 0 0" : "58% 0 0 0",
      background: "rgba(56,120,160,.75)"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "7px 9px",
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "10px",
      color: "var(--text-subtle)"
    }
  }, "CPA1001/F01 \xB7 ", pr.code), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11.5px",
      fontWeight: "var(--weight-semibold)",
      marginTop: "2px"
    }
  }, pr.name)))))));
}
function SponsorReports() {
  const allowed = EXPORTS.filter(e => e.who.includes("ลูกค้า"));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(PageTitle, {
    eyebrow: "\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19",
    title: "\u0E44\u0E1F\u0E25\u0E4C\u0E17\u0E35\u0E48\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17\u0E02\u0E2D\u0E07\u0E17\u0E48\u0E32\u0E19\u0E14\u0E32\u0E27\u0E19\u0E4C\u0E42\u0E2B\u0E25\u0E14\u0E44\u0E14\u0E49",
    sub: "\u0E02\u0E2D\u0E1A\u0E40\u0E02\u0E15\u0E08\u0E33\u0E01\u0E31\u0E14\u0E2D\u0E22\u0E39\u0E48\u0E17\u0E35\u0E48\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E17\u0E35\u0E48\u0E17\u0E48\u0E32\u0E19\u0E2A\u0E19\u0E31\u0E1A\u0E2A\u0E19\u0E38\u0E19 \xB7 \u0E17\u0E38\u0E01\u0E44\u0E1F\u0E25\u0E4C\u0E43\u0E0A\u0E49 CPA code \u0E41\u0E17\u0E19\u0E0A\u0E37\u0E48\u0E2D"
  }), /*#__PURE__*/React.createElement(Section, {
    title: "\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E17\u0E35\u0E48\u0E40\u0E1B\u0E34\u0E14\u0E43\u0E2B\u0E49\u0E14\u0E32\u0E27\u0E19\u0E4C\u0E42\u0E2B\u0E25\u0E14",
    pad: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: "name",
      label: "รายงาน",
      render: r => /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, r.name), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "11px",
          color: "var(--text-subtle)"
        }
      }, r.note))
    }, {
      key: "fmt",
      label: "รูปแบบ",
      render: r => /*#__PURE__*/React.createElement(Tag, {
        tone: "teal"
      }, r.fmt)
    }, {
      key: "scope",
      label: "ขอบเขต"
    }, {
      key: "a",
      label: "",
      align: "right",
      render: () => /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "outline",
        iconLeft: /*#__PURE__*/React.createElement(Icon, {
          name: "download",
          size: 14
        })
      }, "\u0E14\u0E32\u0E27\u0E19\u0E4C\u0E42\u0E2B\u0E25\u0E14")
    }],
    rows: allowed
  })), /*#__PURE__*/React.createElement(Section, {
    title: "\u0E43\u0E1A\u0E23\u0E31\u0E1A\u0E23\u0E2D\u0E07\u0E40\u0E04\u0E23\u0E14\u0E34\u0E15\u0E17\u0E35\u0E48\u0E2D\u0E2D\u0E01\u0E41\u0E25\u0E49\u0E27",
    sub: "\u0E2D\u0E2D\u0E01\u0E42\u0E14\u0E22\u0E2D\u0E07\u0E04\u0E4C\u0E01\u0E32\u0E23\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E01\u0E4A\u0E32\u0E0B\u0E40\u0E23\u0E37\u0E2D\u0E19\u0E01\u0E23\u0E30\u0E08\u0E01 (\u0E2D\u0E1A\u0E01.) \u0E2B\u0E25\u0E31\u0E07\u0E01\u0E32\u0E23\u0E17\u0E27\u0E19\u0E2A\u0E2D\u0E1A",
    pad: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    columns: [{
      key: "id",
      label: "เลขที่ใบรับรอง"
    }, {
      key: "season",
      label: "ฤดู"
    }, {
      key: "vol",
      label: "tCO₂eq",
      align: "right"
    }, {
      key: "status",
      label: "สถานะ",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        tone: r.tone
      }, r.status)
    }, {
      key: "d",
      label: "วันที่ออก"
    }],
    rows: [{
      id: "TVER-2568-0142",
      season: "นาปี 2568",
      vol: f3(SEASONS[0].verified),
      status: "คงเหลือในบัญชี",
      tone: "success",
      d: "12 มี.ค. 2569"
    }, {
      id: "TVER-2568-0143",
      season: "นาปรัง 2568",
      vol: f3(SEASONS[1].verified),
      status: "ยกเลิกเพื่อชดเชยแล้ว",
      tone: "neutral",
      d: "20 พ.ค. 2569"
    }, {
      id: "TVER-2569-xxxx",
      season: "นาปี + นาปรัง 2569",
      vol: f3(ESTIMATE) + " (ประมาณการ)",
      status: "รอทวนสอบ",
      tone: "warning",
      d: "—"
    }]
  })));
}
Object.assign(window, {
  SponsorOverview,
  SponsorAreas,
  SponsorReports
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sponsor_portal/SponsorScreens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/HomeSections.jsx
try { (() => {
const {
  SectionHeading,
  StatCounter,
  Button,
  Card,
  Tag,
  Badge,
  Icon,
  GradientRule
} = window.NetZeroCarbonDesignSystem_f3e7a8;
const SOLUTIONS = [{
  icon: "badge-check",
  title: "Facilitation of Carbon Credit Verification"
}, {
  icon: "warehouse",
  title: "Carbon Credits and RECs Warehousing & Trading"
}, {
  icon: "cpu",
  title: "Support the Climate Technology"
}, {
  icon: "wind",
  title: "Develop projects to build sustainability and expanding renewable energy"
}, {
  icon: "sprout",
  title: "Develop sustainability in agriculture projects"
}, {
  icon: "graduation-cap",
  title: "Provide knowledge in sustainability"
}];
const PROJECTS = [{
  tag: "Hydro",
  icon: "waves",
  title: "Huong Dien Hydropower Project",
  blurb: "The 81 MW hydropower project in Thua Thien Hue, Vietnam."
}, {
  tag: "Solar",
  icon: "sun",
  title: "Europlast Long An Solar Farm",
  blurb: "The 50 MW solar farm power plant in Long An, Vietnam."
}, {
  tag: "Wind",
  icon: "wind",
  title: "Tai Tam Wind Power Plant",
  blurb: "48 MW across 15 turbines in Quang Tri, Vietnam, feeding the national grid."
}];
const NEWS = [{
  date: "24 Jun 2026",
  title: "NetZeroCarbon Achieves Carbon Neutral Organization Certification from TGO",
  blurb: "On June 24th, 2026, NetZeroCarbon Co., Ltd. was officially granted…"
}, {
  date: "01 Apr 2026",
  title: "NetZeroCarbon Secures Official Carbon Footprint of Organization (CFO) Certification",
  blurb: "On April 1st, NetZeroCarbon Co., Ltd. was officially granted the…"
}, {
  date: "21 Aug 2025",
  title: "SCBX partners with NetZero Carbon to transition Thai rice to a low-carbon crop",
  blurb: "SCBX Public Company Limited reinforces its commitment to ESG…"
}];
function Hero({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      minHeight: "560px",
      display: "grid",
      alignItems: "center",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/imagery/renewables-wind-farm.png",
    alt: "",
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(90deg,rgba(6,30,92,.92) 0%,rgba(6,30,92,.74) 42%,rgba(6,30,92,.15) 100%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "var(--space-20) var(--space-6)",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "42ch",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: "var(--teal-300)"
    }
  }, "NetZeroCarbon"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: "var(--text-6xl)",
      fontWeight: "var(--weight-light)",
      lineHeight: "var(--leading-tight)",
      letterSpacing: "var(--tracking-display)",
      color: "#fff"
    }
  }, "Turning DeCarbonization into ", /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: "var(--weight-bold)"
    }
  }, "Profitable Growth"), "."), /*#__PURE__*/React.createElement(GradientRule, {
    width: 120
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-md)",
      lineHeight: "var(--leading-relaxed)",
      color: "rgba(255,255,255,.82)"
    }
  }, "We support companies to achieve their Carbon Neutral and Net Zero Emissions targets across Thailand, Vietnam and Southeast Asia."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 16
    }),
    onClick: () => onNavigate("about")
  }, "Discover More"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "onDark",
    onClick: () => onNavigate("recs")
  }, "Buy / Sell RECs")))));
}
function StatsBand() {
  const items = [{
    v: 34,
    s: "+",
    label: "Our Projects",
    d: "We purchase carbon credits from renewable energy project developers across South East Asia."
  }, {
    v: 500,
    s: "k++",
    label: "RECs",
    d: "Renewable Energy Certificates sourced from solar, wind and hydro developers."
  }, {
    v: 1365.32,
    s: " ha",
    label: "Rai AWD Area",
    d: "Alternate Wetting and Drying for sustainable rice cultivation."
  }, {
    v: 0.38,
    s: " t",
    label: "tCO2e / Rai from AWD",
    d: "Verified GHG reduction through the AWD method in rice cultivation."
  }];
  return /*#__PURE__*/React.createElement(Section, {
    tone: "sunken",
    tight: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "var(--space-10)"
    }
  }, items.map(i => /*#__PURE__*/React.createElement(StatCounter, {
    key: i.label,
    value: i.v,
    suffix: i.s,
    label: i.label,
    description: i.d
  }))));
}
function SolutionsGrid({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Our Solutions",
    title: "Six pillars that carry a business to net zero",
    align: "center",
    lead: "Verification, trading, climate technology, renewable development, sustainable agriculture and education."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--space-6)",
      marginTop: "var(--space-12)"
    }
  }, SOLUTIONS.map(s => /*#__PURE__*/React.createElement(Card, {
    key: s.title,
    interactive: true,
    title: s.title,
    media: /*#__PURE__*/React.createElement("div", {
      style: {
        height: "96px",
        display: "grid",
        placeItems: "center",
        background: "var(--surface-accent-soft)",
        color: "var(--teal-700)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: s.icon,
      size: 30
    }))
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginTop: "var(--space-10)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    onClick: () => onNavigate("solutions"),
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 16
    })
  }, "Discover More")));
}
function ProjectsStrip({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement(Section, {
    tone: "sunken"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Our Projects",
    title: "Renewable Energy Power Plant",
    lead: "Net Zero Carbon operates a portfolio of 34 renewable energy projects across Vietnam, spanning hydropower, wind and solar power."
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    onClick: () => onNavigate("projects")
  }, "View all projects")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--space-6)",
      marginTop: "var(--space-12)"
    }
  }, PROJECTS.map(p => /*#__PURE__*/React.createElement(Card, {
    key: p.title,
    interactive: true,
    media: "../../assets/imagery/renewables-wind-farm.png",
    title: p.title,
    footer: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: p.icon,
        size: 13
      })
    }, p.tag), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconRight: /*#__PURE__*/React.createElement(Icon, {
        name: "arrow-right",
        size: 14
      })
    }, "Read more"))
  }, p.blurb))));
}
function AwdBand() {
  const facts = [["30%", "Of methane reduction"], ["4.02", "tCO2e / ha / crop"], ["20%", "Of yield increase"], ["50%", "Reduction of water use"]];
  return /*#__PURE__*/React.createElement(Section, {
    tone: "inverse"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-16)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeading, {
    tone: "dark",
    eyebrow: "What is AWD?",
    title: "Alternate Wetting and Drying for sustainable rice cultivation",
    lead: "Unlike traditional methods, AWD optimizes water usage by strategically alternating between flooding and drying periods in rice fields \u2014 cutting water use and methane emissions from paddy fields."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3)",
      marginTop: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "success"
  }, "Pathumthani, Thailand"), /*#__PURE__*/React.createElement(Badge, {
    tone: "success"
  }, "Dak Lak, Vietnam"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-8)"
    }
  }, facts.map(([v, l]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      padding: "var(--space-5)",
      border: "1px solid var(--border-on-dark)",
      borderRadius: "var(--radius-card)",
      background: "rgba(255,255,255,.05)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-4xl)",
      fontWeight: "var(--weight-light)",
      color: "var(--teal-300)",
      lineHeight: 1
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: "rgba(255,255,255,.72)",
      marginTop: "var(--space-2)"
    }
  }, l))))));
}
function NewsStrip({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Company News",
    title: "What we have been up to"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    onClick: () => onNavigate("news")
  }, "Discover More")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--space-6)",
      marginTop: "var(--space-12)"
    }
  }, NEWS.map(n => /*#__PURE__*/React.createElement(Card, {
    key: n.title,
    interactive: true,
    eyebrow: n.date,
    title: n.title,
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconRight: /*#__PURE__*/React.createElement(Icon, {
        name: "arrow-right",
        size: 14
      })
    }, "Read More")
  }, n.blurb))));
}
function PartnersStrip() {
  return /*#__PURE__*/React.createElement(Section, {
    tone: "sunken",
    tight: true
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Our Partners & Clients",
    title: "Trusted by developers, banks and certifiers",
    align: "center",
    rule: false
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-8)",
      border: "1px dashed var(--border-default)",
      borderRadius: "var(--radius-card)",
      padding: "var(--space-10)",
      textAlign: "center",
      color: "var(--text-subtle)",
      fontSize: "var(--text-sm)"
    }
  }, "Partner and client logos were not included in the supplied brand package \u2014 this strip is intentionally left blank."));
}
Object.assign(window, {
  Hero,
  StatsBand,
  SolutionsGrid,
  ProjectsStrip,
  AwdBand,
  NewsStrip,
  PartnersStrip,
  SOLUTIONS,
  PROJECTS,
  NEWS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/HomeSections.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Screens.jsx
try { (() => {
const {
  SectionHeading,
  Button,
  Card,
  Tag,
  Badge,
  Icon,
  Field,
  Input,
  Select,
  Textarea,
  Checkbox,
  StatCounter,
  GradientRule
} = window.NetZeroCarbonDesignSystem_f3e7a8;
function PageHeader({
  eyebrow,
  title,
  lead
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      overflow: "hidden",
      background: "var(--gradient-deep)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "var(--space-20) var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    tone: "dark",
    as: "h1",
    eyebrow: eyebrow,
    title: title,
    lead: lead
  })));
}
function ProjectsScreen() {
  const [filter, setFilter] = React.useState("All");
  const all = [{
    tag: "Hydro",
    icon: "waves",
    title: "Huong Dien Hydropower Project",
    loc: "Thua Thien Hue, Vietnam",
    mw: "81 MW",
    blurb: "Run-of-river hydropower feeding the national grid, verified by an accredited Certified Body."
  }, {
    tag: "Solar",
    icon: "sun",
    title: "Europlast Long An Solar Farm",
    loc: "Long An, Vietnam",
    mw: "50 MW",
    blurb: "Utility-scale solar farm supplying RECs to corporate offtakers across Southeast Asia."
  }, {
    tag: "Wind",
    icon: "wind",
    title: "Tai Tam Wind Power Plant",
    loc: "Quang Tri, Vietnam",
    mw: "48 MW",
    blurb: "15 turbines producing more than 150,000 MWh a year, paired with SCADA and telemetry."
  }, {
    tag: "AWD",
    icon: "sprout",
    title: "Pathumthani AWD R&D",
    loc: "Pathumthani, Thailand",
    mw: "1,365 ha",
    blurb: "Alternate Wetting and Drying pilot converting traditional paddy to a low-carbon crop."
  }, {
    tag: "AWD",
    icon: "sprout",
    title: "Dak Lak AWD Programme",
    loc: "Dak Lak, Vietnam",
    mw: "820 ha",
    blurb: "Farmer-led rollout of AWD irrigation with monitoring of wet and dry field cycles."
  }, {
    tag: "Hydro",
    icon: "waves",
    title: "Northern Highlands Hydro Cluster",
    loc: "Northern Vietnam",
    mw: "112 MW",
    blurb: "A cluster of small hydropower stations aggregated into a single REC portfolio."
  }];
  const tabs = ["All", "Solar", "Wind", "Hydro", "AWD"];
  const shown = filter === "All" ? all : all.filter(p => p.tag === filter);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    eyebrow: "Our Projects",
    title: "34 renewable energy projects across Vietnam and Thailand",
    lead: "From the northern highlands to the southern provinces \u2014 hydropower, wind, solar and low-carbon rice, all verified by Certified Bodies."
  }), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-2)",
      marginBottom: "var(--space-10)"
    }
  }, tabs.map(t => /*#__PURE__*/React.createElement(Button, {
    key: t,
    size: "sm",
    variant: filter === t ? "primary" : "outline",
    onClick: () => setFilter(t)
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--space-6)"
    }
  }, shown.map(p => /*#__PURE__*/React.createElement(Card, {
    key: p.title,
    interactive: true,
    media: "../../assets/imagery/renewables-wind-farm.png",
    title: p.title,
    footer: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: p.icon,
        size: 13
      })
    }, p.tag), /*#__PURE__*/React.createElement(Badge, {
      tone: "success"
    }, "CB Verified"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3)",
      marginBottom: "var(--space-2)",
      color: "var(--text-heading)",
      fontWeight: "var(--weight-semibold)",
      fontSize: "var(--text-sm)"
    }
  }, /*#__PURE__*/React.createElement("span", null, p.mw), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--border-default)"
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--weight-regular)",
      color: "var(--text-muted)"
    }
  }, p.loc)), p.blurb)))));
}
function SolutionsScreen() {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    eyebrow: "Our Solutions",
    title: "Everything between a carbon target and a verified credit",
    lead: "We are a non-developer holder of carbon credits, which lets us stay unbiased in how we serve clients."
  }), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(2,1fr)",
      gap: "var(--space-6)"
    }
  }, window.SOLUTIONS.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: s.title,
    style: {
      display: "flex",
      gap: "var(--space-5)",
      padding: "var(--space-6)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-card)",
      background: "var(--surface-card)",
      boxShadow: "var(--shadow-sm)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "0 0 56px",
      width: "56px",
      height: "56px",
      borderRadius: "var(--radius-circle)",
      background: "var(--surface-accent-soft)",
      color: "var(--teal-700)",
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: s.icon,
    size: 24
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-xs)",
      color: "var(--text-subtle)",
      marginBottom: "4px"
    }
  }, "0", i + 1), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 var(--space-2)",
      fontSize: "var(--text-lg)"
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      color: "var(--text-muted)",
      lineHeight: "var(--leading-relaxed)"
    }
  }, "Delivered with globally recognised Certified Bodies so every credit and certificate stands up to audit.")))))), /*#__PURE__*/React.createElement(Section, {
    tone: "sunken",
    tight: true
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Green Hotel Plus",
    title: "A national standard, recognised by the GSTC",
    lead: "Out of 8 companies officially certified by Thailand's Department of Climate Change and Environment, we are the sole company to audit and verify every G-Green program."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--space-6)",
      marginTop: "var(--space-10)"
    }
  }, [["Minimise impact", "leaf"], ["Cut operating cost", "piggy-bank"], ["Attract eco-conscious travellers", "plane"]].map(([t, ic]) => /*#__PURE__*/React.createElement(Card, {
    key: t,
    title: t,
    media: /*#__PURE__*/React.createElement("div", {
      style: {
        height: "88px",
        display: "grid",
        placeItems: "center",
        background: "var(--navy-50)",
        color: "var(--navy-700)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: ic,
      size: 26
    }))
  })))));
}
function NewsScreen() {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    eyebrow: "Company News",
    title: "Certifications, partnerships and field reports"
  }), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(2,1fr)",
      gap: "var(--space-6)"
    }
  }, window.NEWS.concat([{
    date: "26 Aug 2025",
    title: "NetZeroCarbon and Blockedge present tokenized carbon credits to Chiang Mai University",
    blurb: "In collaboration with Blockedge, we presented tokenized carbon credits…"
  }, {
    date: "23 Jul 2025",
    title: "Vietnam's green transformation: hotels, businesses and rice producers join forces",
    blurb: "Net Zero Carbon Joint Stock Company convened partners in Ho Chi Minh City…"
  }]).map(n => /*#__PURE__*/React.createElement(Card, {
    key: n.title,
    interactive: true,
    media: "../../assets/imagery/signage-application.png",
    eyebrow: n.date,
    title: n.title,
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconRight: /*#__PURE__*/React.createElement(Icon, {
        name: "arrow-right",
        size: 14
      })
    }, "Read More")
  }, n.blurb)))));
}
function AboutScreen() {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    eyebrow: "About Us",
    title: "Sustainability must be done by everyone, not just by someone",
    lead: "Following the Paris Agreement at COP21, Thailand pledged to cut greenhouse gas emissions by 20% against the usual trajectory by 2030, with further reductions of 40% with financial and technological support."
  }), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-16)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Our Vision",
    title: "The green future will arrive much sooner than expected",
    lead: "Being a non-developer holder of carbon credits allows us to provide an unbiased approach to serving our clients. Our expertise in carbon offsetting, sustainability and verification processes is our competitive edge."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)"
    }
  }, ["Invest in Climate Technology", "Develop projects to build sustainability and expand renewable energy", "Build sustainability in agriculture — reducing GHGs, increasing yields and reducing poverty", "Provide knowledge in sustainability to build awareness and understanding"].map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: p,
    style: {
      display: "flex",
      gap: "var(--space-4)",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "0 0 32px",
      width: "32px",
      height: "32px",
      borderRadius: "var(--radius-circle)",
      background: "var(--navy-900)",
      color: "#fff",
      display: "grid",
      placeItems: "center",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)"
    }
  }, i + 1), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-base)",
      lineHeight: "var(--leading-relaxed)",
      color: "var(--text-body)"
    }
  }, p)))))), /*#__PURE__*/React.createElement(Section, {
    tone: "sunken",
    tight: true
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Our Values",
    title: "Reliability, consistency, transparency",
    align: "center"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--space-6)",
      marginTop: "var(--space-10)"
    }
  }, [["Reliability", "shield-check", "We partner with globally recognized Certified Bodies to verify the authenticity and quality of RECs sourced from reputable project developers."], ["Consistency", "repeat", "Since our inception we have stayed dedicated to environmental awareness and education through campaigns, seminars and ongoing support."], ["Transparency", "activity", "Real-time monitoring of AWD fields: track field age, wet or dry process status, and potential GHG reductions at your fingertips."]].map(([t, ic, d]) => /*#__PURE__*/React.createElement(Card, {
    key: t,
    title: t,
    media: /*#__PURE__*/React.createElement("div", {
      style: {
        height: "88px",
        display: "grid",
        placeItems: "center",
        background: "var(--surface-accent-soft)",
        color: "var(--teal-700)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: ic,
      size: 26
    }))
  }, d)))));
}
function RecsScreen() {
  const [sent, setSent] = React.useState(false);
  const [types, setTypes] = React.useState({
    Solar: true,
    Wind: false,
    Hydro: true,
    AWD: false
  });
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    eyebrow: "Buy / Sell RECs",
    title: "Renewable Energy Certificates, verified by Certified Bodies",
    lead: "Tell us the volume and the technology mix you need. We source from solar, wind and hydro developers across Southeast Asia."
  }), /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.1fr .9fr",
      gap: "var(--space-16)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-8)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-card)",
      boxShadow: "var(--shadow-md)",
      background: "var(--surface-card)"
    }
  }, sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "success"
  }, "Enquiry received"), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: "var(--text-xl)",
      fontWeight: "var(--weight-light)"
    }
  }, "Thank you \u2014 our trading desk will reply within one working day."), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm",
    onClick: () => setSent(false)
  }, "Send another enquiry")) : /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    },
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Name",
    required: true,
    htmlFor: "r-n"
  }, /*#__PURE__*/React.createElement(Input, {
    id: "r-n",
    placeholder: "Somchai Prasert",
    required: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Work email",
    required: true,
    htmlFor: "r-e"
  }, /*#__PURE__*/React.createElement(Input, {
    id: "r-e",
    type: "email",
    placeholder: "you@company.com",
    required: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Department",
    htmlFor: "r-d"
  }, /*#__PURE__*/React.createElement(Select, {
    id: "r-d",
    defaultValue: ""
  }, /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, "Choose one"), /*#__PURE__*/React.createElement("option", null, "Project Consultant"), /*#__PURE__*/React.createElement("option", null, "Trading"), /*#__PURE__*/React.createElement("option", null, "Media"), /*#__PURE__*/React.createElement("option", null, "etc."))), /*#__PURE__*/React.createElement(Field, {
    label: "Volume (MWh)",
    htmlFor: "r-v",
    hint: "Annual requirement"
  }, /*#__PURE__*/React.createElement(Input, {
    id: "r-v",
    type: "number",
    placeholder: "5,000"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "1 / -1"
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Technology"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-6)",
      paddingTop: "var(--space-1)"
    }
  }, Object.keys(types).map(t => /*#__PURE__*/React.createElement(Checkbox, {
    key: t,
    label: t,
    checked: types[t],
    onChange: e => setTypes({
      ...types,
      [t]: e.target.checked
    })
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "1 / -1"
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Message",
    htmlFor: "r-m"
  }, /*#__PURE__*/React.createElement(Textarea, {
    id: "r-m",
    rows: 4,
    placeholder: "Tell us about your offsetting target."
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "1 / -1",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "I agree to be contacted about pricing."
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "send",
      size: 15
    })
  }, "Send")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(StatCounter, {
    value: 34,
    suffix: "+",
    label: "Projects"
  }), /*#__PURE__*/React.createElement(StatCounter, {
    value: 500,
    suffix: "k++",
    label: "RECs available"
  })), /*#__PURE__*/React.createElement(GradientRule, {
    width: "100%",
    thickness: 2
  }), [["Phone", "phone", "+66 (0) 63-298-4955"], ["Whatsapp", "message-circle", "+66 (0) 63-298-4955"], ["Email", "mail", "support@netzero-carbon.io"], ["Office", "map-pin", "33, Soi Soonvijai 4, Bang Kapi, Huai Khwang, Bangkok 10310"]].map(([t, ic, v]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: "flex",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "0 0 40px",
      width: "40px",
      height: "40px",
      borderRadius: "var(--radius-circle)",
      background: "var(--navy-50)",
      color: "var(--navy-700)",
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)"
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-muted)"
    }
  }, v))))))));
}
Object.assign(window, {
  PageHeader,
  ProjectsScreen,
  SolutionsScreen,
  NewsScreen,
  AboutScreen,
  RecsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/SiteChrome.jsx
try { (() => {
const {
  Logo,
  SectionHeading,
  Button,
  Icon,
  Tag
} = window.NetZeroCarbonDesignSystem_f3e7a8;
const NAV = [{
  id: "home",
  label: "Home"
}, {
  id: "about",
  label: "About"
}, {
  id: "projects",
  label: "Our Projects"
}, {
  id: "solutions",
  label: "Our Solutions"
}, {
  id: "news",
  label: "News"
}, {
  id: "recs",
  label: "Buy / Sell RECs"
}];
function SiteHeader({
  screen,
  onNavigate,
  lang,
  onLang
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 30,
      background: "rgba(255,255,255,.88)",
      backdropFilter: "blur(var(--blur-glass))",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "0 var(--space-6)",
      height: "82px",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#home",
    onClick: e => {
      e.preventDefault();
      onNavigate("home");
    },
    style: {
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    assetBase: "../../assets/logos",
    height: 38
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: "var(--space-6)",
      marginLeft: "auto"
    }
  }, NAV.map(n => /*#__PURE__*/React.createElement("a", {
    key: n.id,
    href: "#" + n.id,
    onClick: e => {
      e.preventDefault();
      onNavigate(n.id);
    },
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--weight-semibold)",
      color: screen === n.id ? "var(--text-accent)" : "var(--text-body)",
      paddingBottom: "3px",
      borderBottom: "2px solid " + (screen === n.id ? "var(--teal-600)" : "transparent")
    }
  }, n.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onLang(lang === "EN" ? "TH" : "EN"),
    style: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: "none",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-pill)",
      height: "34px",
      padding: "0 var(--space-3)",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-muted)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "globe",
    size: 14
  }), lang), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: () => onNavigate("contact")
  }, "Contact Us"))));
}
function SiteFooter({
  onNavigate
}) {
  const col = (title, items) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-semibold)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: "var(--teal-300)"
    }
  }, title), items.map(i => /*#__PURE__*/React.createElement("a", {
    key: i.label,
    href: "#",
    onClick: e => {
      e.preventDefault();
      i.to && onNavigate(i.to);
    },
    style: {
      fontSize: "var(--text-sm)",
      color: "rgba(255,255,255,.72)"
    }
  }, i.label)));
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--surface-inverse)",
      color: "var(--text-on-dark)",
      paddingTop: "var(--space-16)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "0 var(--space-6)",
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr 1fr 1.3fr",
      gap: "var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    assetBase: "../../assets/logos",
    lockup: "vertical",
    tone: "white",
    height: 104
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-relaxed)",
      color: "rgba(255,255,255,.72)",
      maxWidth: "34ch"
    }
  }, "Because we believe that sustainability must be done by everyone, not just by someone.")), col("Company", [{
    label: "Home",
    to: "home"
  }, {
    label: "About",
    to: "about"
  }, {
    label: "Our Projects",
    to: "projects"
  }, {
    label: "Our Solutions",
    to: "solutions"
  }]), col("Engage", [{
    label: "News",
    to: "news"
  }, {
    label: "Join Us"
  }, {
    label: "Buy / Sell RECs",
    to: "recs"
  }, {
    label: "Contact Us",
    to: "contact"
  }]), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: "var(--weight-semibold)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: "var(--teal-300)"
    }
  }, "Office"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-relaxed)",
      color: "rgba(255,255,255,.72)"
    }
  }, "33, Soi Soonvijai 4, Bang Kapi,", /*#__PURE__*/React.createElement("br", null), "Huai Khwang, Bangkok 10310"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "rgba(255,255,255,.72)"
    }
  }, "+66 (0) 63-298-4955"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--teal-300)"
    }
  }, "support@netzero-carbon.io"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-2)",
      marginTop: "var(--space-2)"
    }
  }, ["facebook", "instagram", "youtube", "linkedin"].map(n => /*#__PURE__*/React.createElement("span", {
    key: n,
    style: {
      width: "34px",
      height: "34px",
      borderRadius: "var(--radius-circle)",
      border: "1px solid var(--border-on-dark)",
      display: "grid",
      placeItems: "center",
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: n,
    size: 15
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "var(--space-12) auto 0",
      padding: "var(--space-5) var(--space-6)",
      borderTop: "1px solid var(--border-on-dark)",
      display: "flex",
      justifyContent: "space-between",
      fontSize: "var(--text-xs)",
      color: "rgba(255,255,255,.5)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 NetZeroCarbon Co., Ltd."), /*#__PURE__*/React.createElement("span", null, "Carbon Neutral Organization \xB7 TGO certified")));
}
function Section({
  children,
  tone = "page",
  tight = false,
  style
}) {
  const bg = tone === "sunken" ? "var(--surface-sunken)" : tone === "inverse" ? "var(--surface-inverse)" : "var(--surface-page)";
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: bg,
      padding: (tight ? "var(--section-y-tight)" : "var(--section-y)") + " var(--space-6)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto"
    }
  }, children));
}
Object.assign(window, {
  NAV,
  SiteHeader,
  SiteFooter,
  Section
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/SiteChrome.jsx", error: String((e && e.message) || e) }); }

__ds_ns.GradientRule = __ds_scope.GradientRule;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.StatCounter = __ds_scope.StatCounter;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.FilterBar = __ds_scope.FilterBar;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.StatTile = __ds_scope.StatTile;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.ChatBubble = __ds_scope.ChatBubble;

__ds_ns.ChatDivider = __ds_scope.ChatDivider;

__ds_ns.PhotoBubble = __ds_scope.PhotoBubble;

__ds_ns.FlexMessage = __ds_scope.FlexMessage;

__ds_ns.PhoneFrame = __ds_scope.PhoneFrame;

__ds_ns.ChatHeader = __ds_scope.ChatHeader;

__ds_ns.ChatCanvas = __ds_scope.ChatCanvas;

__ds_ns.QuickReplies = __ds_scope.QuickReplies;

__ds_ns.RichMenu = __ds_scope.RichMenu;

})();
