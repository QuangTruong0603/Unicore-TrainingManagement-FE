import type { AppProps } from "next/app";
import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/router";
import { Provider } from "react-redux";

import { store } from "@/store";
import { fontSans, fontMono } from "@/config/fonts";
import "@/styles/globals.css";

// Add these type definitions for pages with layouts
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();
  const queryClient = new QueryClient();

  // Use the layout defined at the page level, or fall back to just rendering the page
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <Provider store={store}>
      <HeroUIProvider navigate={router.push}>
        <QueryClientProvider client={queryClient}>
          {getLayout(<Component {...pageProps} />)}
        </QueryClientProvider>
      </HeroUIProvider>
    </Provider>
  );
}

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};
