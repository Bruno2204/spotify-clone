import { useRef, useState } from "react";

export default function SideMenuLayout({ children }) {
  const COLLAPSED_WIDTH = 72;
  const DEFAULT_WIDTH = 280;
  const MAX_WIDTH = 400;
  const SNAP_THRESHOLD = 160;

  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  return <aside className='[grid-area:aside] flex flex-col '>{children}</aside>;
}