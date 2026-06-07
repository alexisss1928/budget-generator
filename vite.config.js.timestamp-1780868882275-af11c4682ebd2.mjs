// vite.config.js
import { VitePWA } from "file:///C:/Users/ale6j/Documents/Development/Proyectos/ClinicManager/presupuestos-sell/node_modules/vite-plugin-pwa/dist/index.js";
import { defineConfig } from "file:///C:/Users/ale6j/Documents/Development/Proyectos/ClinicManager/presupuestos-sell/node_modules/vite/dist/node/index.js";
var manifestForPlugin = {
  registerType: "autoUpdate",
  injectRegister: "auto",
  devOptions: {
    enabled: true
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg}"]
  },
  includeAssets: ["**/*.{js,css,html,ico,png,svg}"],
  manifest: {
    name: "Doctor Companion",
    short_name: "DC",
    description: "An app that can help you in your daily tasks",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "apple touch icon"
      }
    ],
    theme_color: "#7e9c7f",
    background_color: "#464646",
    display: "standalone",
    scope: "/",
    start_url: "/",
    orientation: "portrait"
  }
};
var vite_config_default = defineConfig({
  base: "/",
  plugins: [VitePWA(manifestForPlugin)]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhbGU2alxcXFxEb2N1bWVudHNcXFxcRGV2ZWxvcG1lbnRcXFxcUHJveWVjdG9zXFxcXENsaW5pY01hbmFnZXJcXFxccHJlc3VwdWVzdG9zLXNlbGxcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGFsZTZqXFxcXERvY3VtZW50c1xcXFxEZXZlbG9wbWVudFxcXFxQcm95ZWN0b3NcXFxcQ2xpbmljTWFuYWdlclxcXFxwcmVzdXB1ZXN0b3Mtc2VsbFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvYWxlNmovRG9jdW1lbnRzL0RldmVsb3BtZW50L1Byb3llY3Rvcy9DbGluaWNNYW5hZ2VyL3ByZXN1cHVlc3Rvcy1zZWxsL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSc7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5cclxuY29uc3QgbWFuaWZlc3RGb3JQbHVnaW4gPSB7XHJcbiAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXHJcbiAgaW5qZWN0UmVnaXN0ZXI6ICdhdXRvJyxcclxuICBkZXZPcHRpb25zOiB7XHJcbiAgICBlbmFibGVkOiB0cnVlLFxyXG4gIH0sXHJcbiAgd29ya2JveDoge1xyXG4gICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLGljbyxwbmcsc3ZnfSddLFxyXG4gIH0sXHJcbiAgaW5jbHVkZUFzc2V0czogWycqKi8qLntqcyxjc3MsaHRtbCxpY28scG5nLHN2Z30nXSxcclxuICBtYW5pZmVzdDoge1xyXG4gICAgbmFtZTogJ0RvY3RvciBDb21wYW5pb24nLFxyXG4gICAgc2hvcnRfbmFtZTogJ0RDJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnQW4gYXBwIHRoYXQgY2FuIGhlbHAgeW91IGluIHlvdXIgZGFpbHkgdGFza3MnLFxyXG4gICAgaWNvbnM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHNyYzogJy9hbmRyb2lkLWNocm9tZS0xOTJ4MTkyLnBuZycsXHJcbiAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcclxuICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHNyYzogJy9hbmRyb2lkLWNocm9tZS01MTJ4NTEyLnBuZycsXHJcbiAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcclxuICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHNyYzogJy9hcHBsZS10b3VjaC1pY29uLnBuZycsXHJcbiAgICAgICAgc2l6ZXM6ICcxODB4MTgwJyxcclxuICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICBwdXJwb3NlOiAnYXBwbGUgdG91Y2ggaWNvbicsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gICAgdGhlbWVfY29sb3I6ICcjN2U5YzdmJyxcclxuICAgIGJhY2tncm91bmRfY29sb3I6ICcjNDY0NjQ2JyxcclxuICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcclxuICAgIHNjb3BlOiAnLycsXHJcbiAgICBzdGFydF91cmw6ICcvJyxcclxuICAgIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnLFxyXG4gIH0sXHJcbn07XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIGJhc2U6ICcvJyxcclxuICBwbHVnaW5zOiBbVml0ZVBXQShtYW5pZmVzdEZvclBsdWdpbildLFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE0YSxTQUFTLGVBQWU7QUFDcGMsU0FBUyxvQkFBb0I7QUFFN0IsSUFBTSxvQkFBb0I7QUFBQSxFQUN4QixjQUFjO0FBQUEsRUFDZCxnQkFBZ0I7QUFBQSxFQUNoQixZQUFZO0FBQUEsSUFDVixTQUFTO0FBQUEsRUFDWDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsY0FBYyxDQUFDLGdDQUFnQztBQUFBLEVBQ2pEO0FBQUEsRUFDQSxlQUFlLENBQUMsZ0NBQWdDO0FBQUEsRUFDaEQsVUFBVTtBQUFBLElBQ1IsTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osYUFBYTtBQUFBLElBQ2IsT0FBTztBQUFBLE1BQ0w7QUFBQSxRQUNFLEtBQUs7QUFBQSxRQUNMLE9BQU87QUFBQSxRQUNQLE1BQU07QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLFFBQ0UsS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLFFBQ1AsTUFBTTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsUUFDRSxLQUFLO0FBQUEsUUFDTCxPQUFPO0FBQUEsUUFDUCxNQUFNO0FBQUEsUUFDTixTQUFTO0FBQUEsTUFDWDtBQUFBLElBQ0Y7QUFBQSxJQUNBLGFBQWE7QUFBQSxJQUNiLGtCQUFrQjtBQUFBLElBQ2xCLFNBQVM7QUFBQSxJQUNULE9BQU87QUFBQSxJQUNQLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxFQUNmO0FBQ0Y7QUFHQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixTQUFTLENBQUMsUUFBUSxpQkFBaUIsQ0FBQztBQUN0QyxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
