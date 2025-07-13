import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/react";

import { useAuth } from "@/hooks/useAuth";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, SearchIcon } from "@/components/icons/icons";

export const Navbar = () => {
  const handleLogout = useAuth().logout;
  const user = useAuth().user;
  const studentInfo = useAuth().studentInfo || null;
  const lecturerInfo = useAuth().lecturerInfo || null;

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <HeroUINavbar
      className="border-b border-gray-200"
      maxWidth="xl"
      position="sticky"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start" />

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        {/* <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem> */}
        <NavbarItem className="hidden md:flex">
          <Dropdown>
            <DropdownTrigger>
              <div className="flex items-center gap-2">
                {" "}
                <Avatar
                  className="h-8 w-8"
                  src={
                    studentInfo?.applicationUser?.imageUrl ||
                    lecturerInfo?.applicationUser?.imageUrl ||
                    ""
                  }
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">
                    {user?.email || ""}
                  </span>{" "}
                  <span className="text-xs text-default-500">
                    {user?.role || ""}
                  </span>
                </div>
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="User Actions">
              <DropdownItem
                key="profile"
                as={Link}
                href={
                  user?.role === "Student"
                    ? "/s/profile"
                    : user?.role === "Lecturer"
                      ? "/l/profile"
                      : "/a/profile"
                }
              >
                <div>View Profile</div>
              </DropdownItem>
              <DropdownItem
                key="change-password"
                as={Link}
                className="text-foreground"
                href="/changePassword"
              >
                Change your password
              </DropdownItem>
              <DropdownItem key="logout" onClick={handleLogout}>
                Logout
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href="#"
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
