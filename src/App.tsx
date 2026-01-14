import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Send,
  Sparkles,
  MapPin as MapPinIcon,
  Star,
  Heart,
  Check,
  Search,
  Navigation,
  Filter,
  TrendingUp,
  X,
  Share2,
  Calendar,
  Cloud,
  Utensils,
  ShoppingBag,
  Building2,
  Trees,
  ThumbsUp,
  MessageSquare,
  Clock,
  Route,
} from "lucide-react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Role = "ai" | "user";
type CommentReply = {
  id: string;
  username: string;
  text: string;
  createdAt: number;
};
type Comment = {
  id: string;
  username: string;
  text: string;
  createdAt: number;
  photo?: string | null;
  likes?: string[];
  replies?: CommentReply[];
};
type Rating = {
  userId: string;
  score: number;
};
type OpeningHours = {
  day: number;
  open: string;
  close: string;
};
type Weather = {
  temp: number;
  condition: "sunny" | "cloudy" | "rainy";
  humidity: number;
};
type Spot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  kind: "indoor" | "outdoor" | "user";
  category?:
    | "food"
    | "shopping"
    | "history"
    | "nature"
    | "museum"
    | "shrine"
    | "other";
  createdAt: number;
  photos?: string[];
  comments?: Comment[];
  ratings?: Rating[];
  favorites?: string[];
  visited?: string[];
  openingHours?: OpeningHours[];
  closedDays?: number[];
};
type Message = {
  id: string;
  role: Role;
  text: string;
  proposals?: Spot[];
};
type RoutePoint = [number, number];

const pinIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DEFAULT_CENTER: [number, number] = [34.3955, 132.4547];
const DEFAULT_ZOOM = 12;
const STORAGE_KEY = "hiromap_user_spots";
const USER_KEY = "hiromap_username";

function MapClickHandler({
  onClick,
}: {
  onClick: (e: L.LeafletMouseEvent) => void;
}) {
  useMapEvents({
    click: onClick,
  });
  return null;
}

function App() {
  const mapRef = useRef<L.Map | null>(null);

  const initialSpots = useMemo<Spot[]>(
    () => [
      {
        id: "dome",
        name: "広島平和記念資料館",
        lat: 34.39176,
        lng: 132.45208,
        kind: "indoor",
        category: "museum",
        createdAt: Date.now() - 1000 * 60 * 60 * 5,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 1, open: "08:30", close: "18:00" },
          { day: 2, open: "08:30", close: "18:00" },
          { day: 3, open: "08:30", close: "18:00" },
          { day: 4, open: "08:30", close: "18:00" },
          { day: 5, open: "08:30", close: "18:00" },
          { day: 6, open: "08:30", close: "19:00" },
          { day: 0, open: "08:30", close: "19:00" },
        ],
        closedDays: [],
      },
      {
        id: "castle",
        name: "広島城",
        lat: 34.401,
        lng: 132.459,
        kind: "outdoor",
        category: "history",
        createdAt: Date.now() - 1000 * 60 * 60 * 48,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 1, open: "09:00", close: "17:00" },
          { day: 2, open: "09:00", close: "17:00" },
          { day: 3, open: "09:00", close: "17:00" },
          { day: 4, open: "09:00", close: "17:00" },
          { day: 5, open: "09:00", close: "17:00" },
          { day: 6, open: "09:00", close: "17:00" },
          { day: 0, open: "09:00", close: "17:00" },
        ],
        closedDays: [],
      },
      {
        id: "miyajima",
        name: "宮島 厳島神社",
        lat: 34.2967,
        lng: 132.3199,
        kind: "outdoor",
        category: "shrine",
        createdAt: Date.now() - 1000 * 60 * 20,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 1, open: "06:30", close: "18:00" },
          { day: 2, open: "06:30", close: "18:00" },
          { day: 3, open: "06:30", close: "18:00" },
          { day: 4, open: "06:30", close: "18:00" },
          { day: 5, open: "06:30", close: "18:00" },
          { day: 6, open: "06:30", close: "18:00" },
          { day: 0, open: "06:30", close: "18:00" },
        ],
        closedDays: [],
      },
      {
        id: "gallery",
        name: "近代美術館",
        lat: 34.3903,
        lng: 132.4725,
        kind: "indoor",
        category: "museum",
        createdAt: Date.now() - 1000 * 60 * 10,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 2, open: "10:00", close: "17:00" },
          { day: 3, open: "10:00", close: "17:00" },
          { day: 4, open: "10:00", close: "17:00" },
          { day: 5, open: "10:00", close: "17:00" },
          { day: 6, open: "10:00", close: "17:00" },
          { day: 0, open: "10:00", close: "17:00" },
        ],
        closedDays: [1],
      },
      {
        id: "okonomiyaki1",
        name: "お好み焼き 鶴橋",
        lat: 34.39453,
        lng: 132.45132,
        kind: "indoor",
        category: "food",
        createdAt: Date.now() - 1000 * 60 * 60 * 3,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 1, open: "11:00", close: "21:00" },
          { day: 2, open: "11:00", close: "21:00" },
          { day: 3, open: "11:00", close: "21:00" },
          { day: 4, open: "11:00", close: "21:00" },
          { day: 5, open: "11:00", close: "22:00" },
          { day: 6, open: "11:00", close: "22:00" },
          { day: 0, open: "11:00", close: "21:00" },
        ],
        closedDays: [],
      },
      {
        id: "park1",
        name: "広島中央公園",
        lat: 34.38913,
        lng: 132.45894,
        kind: "outdoor",
        category: "nature",
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 0, open: "05:00", close: "21:00" },
          { day: 1, open: "05:00", close: "21:00" },
          { day: 2, open: "05:00", close: "21:00" },
          { day: 3, open: "05:00", close: "21:00" },
          { day: 4, open: "05:00", close: "21:00" },
          { day: 5, open: "05:00", close: "21:00" },
          { day: 6, open: "05:00", close: "21:00" },
        ],
        closedDays: [],
      },
      {
        id: "shopping1",
        name: "アリスガーデン",
        lat: 34.39805,
        lng: 132.47392,
        kind: "indoor",
        category: "shopping",
        createdAt: Date.now() - 1000 * 60 * 60 * 1,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 0, open: "10:00", close: "21:00" },
          { day: 1, open: "10:00", close: "21:00" },
          { day: 2, open: "10:00", close: "21:00" },
          { day: 3, open: "10:00", close: "21:00" },
          { day: 4, open: "10:00", close: "21:00" },
          { day: 5, open: "10:00", close: "21:00" },
          { day: 6, open: "10:00", close: "21:00" },
        ],
        closedDays: [],
      },
      {
        id: "ramen1",
        name: "らーめん 味噌八",
        lat: 34.40531,
        lng: 132.46892,
        kind: "indoor",
        category: "food",
        createdAt: Date.now() - 1000 * 60 * 45,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 1, open: "11:00", close: "23:00" },
          { day: 2, open: "11:00", close: "23:00" },
          { day: 3, open: "11:00", close: "23:00" },
          { day: 4, open: "11:00", close: "23:00" },
          { day: 5, open: "11:00", close: "23:30" },
          { day: 6, open: "11:00", close: "23:30" },
          { day: 0, open: "11:00", close: "22:00" },
        ],
        closedDays: [],
      },
      {
        id: "cafe1",
        name: "カフェ アロマ",
        lat: 34.38645,
        lng: 132.46234,
        kind: "indoor",
        category: "food",
        createdAt: Date.now() - 1000 * 60 * 60,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 0, open: "08:00", close: "19:00" },
          { day: 1, open: "08:00", close: "19:00" },
          { day: 2, open: "08:00", close: "19:00" },
          { day: 3, open: "08:00", close: "19:00" },
          { day: 4, open: "08:00", close: "19:00" },
          { day: 5, open: "08:00", close: "20:00" },
          { day: 6, open: "08:00", close: "20:00" },
        ],
        closedDays: [],
      },
      {
        id: "arcade1",
        name: "本通り商店街",
        lat: 34.39234,
        lng: 132.46123,
        kind: "outdoor",
        category: "shopping",
        createdAt: Date.now() - 1000 * 60 * 90,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 0, open: "09:00", close: "20:00" },
          { day: 1, open: "09:00", close: "20:00" },
          { day: 2, open: "09:00", close: "20:00" },
          { day: 3, open: "09:00", close: "20:00" },
          { day: 4, open: "09:00", close: "20:00" },
          { day: 5, open: "09:00", close: "21:00" },
          { day: 6, open: "09:00", close: "21:00" },
        ],
        closedDays: [],
      },
      {
        id: "river1",
        name: "太田川河川敷",
        lat: 34.40012,
        lng: 132.44523,
        kind: "outdoor",
        category: "nature",
        createdAt: Date.now() - 1000 * 60 * 120,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 0, open: "06:00", close: "22:00" },
          { day: 1, open: "06:00", close: "22:00" },
          { day: 2, open: "06:00", close: "22:00" },
          { day: 3, open: "06:00", close: "22:00" },
          { day: 4, open: "06:00", close: "22:00" },
          { day: 5, open: "06:00", close: "22:00" },
          { day: 6, open: "06:00", close: "22:00" },
        ],
        closedDays: [],
      },
      {
        id: "shrine1",
        name: "住吉神社",
        lat: 34.37834,
        lng: 132.46723,
        kind: "outdoor",
        category: "shrine",
        createdAt: Date.now() - 1000 * 60 * 150,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 0, open: "06:00", close: "18:00" },
          { day: 1, open: "06:00", close: "18:00" },
          { day: 2, open: "06:00", close: "18:00" },
          { day: 3, open: "06:00", close: "18:00" },
          { day: 4, open: "06:00", close: "18:00" },
          { day: 5, open: "06:00", close: "18:00" },
          { day: 6, open: "06:00", close: "18:00" },
        ],
        closedDays: [],
      },
      {
        id: "food1",
        name: "お好み焼き ひろしま",
        lat: 34.39678,
        lng: 132.4524,
        kind: "indoor",
        category: "food",
        createdAt: Date.now() - 1000 * 60 * 180,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 1, open: "11:00", close: "21:00" },
          { day: 2, open: "11:00", close: "21:00" },
          { day: 3, open: "11:00", close: "21:00" },
          { day: 4, open: "11:00", close: "21:00" },
          { day: 5, open: "11:00", close: "22:00" },
          { day: 6, open: "11:00", close: "22:00" },
          { day: 0, open: "11:00", close: "21:00" },
        ],
        closedDays: [],
      },
      {
        id: "clothing1",
        name: "ファッションモール広島",
        lat: 34.40234,
        lng: 132.4592,
        kind: "indoor",
        category: "shopping",
        createdAt: Date.now() - 1000 * 60 * 200,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 0, open: "10:00", close: "21:00" },
          { day: 1, open: "10:00", close: "21:00" },
          { day: 2, open: "10:00", close: "21:00" },
          { day: 3, open: "10:00", close: "21:00" },
          { day: 4, open: "10:00", close: "21:00" },
          { day: 5, open: "10:00", close: "21:00" },
          { day: 6, open: "10:00", close: "21:00" },
        ],
        closedDays: [],
      },
      {
        id: "museum1",
        name: "広島県立美術館",
        lat: 34.39456,
        lng: 132.46789,
        kind: "indoor",
        category: "museum",
        createdAt: Date.now() - 1000 * 60 * 240,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 2, open: "09:00", close: "17:00" },
          { day: 3, open: "09:00", close: "17:00" },
          { day: 4, open: "09:00", close: "17:00" },
          { day: 5, open: "09:00", close: "17:00" },
          { day: 6, open: "09:00", close: "19:00" },
          { day: 0, open: "09:00", close: "19:00" },
        ],
        closedDays: [1],
      },
      {
        id: "okonomiyaki2",
        name: "お好み焼き 八",
        lat: 34.38923,
        lng: 132.45612,
        kind: "indoor",
        category: "food",
        createdAt: Date.now() - 1000 * 60 * 60 * 4,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 1, open: "11:30", close: "21:30" },
          { day: 2, open: "11:30", close: "21:30" },
          { day: 3, open: "11:30", close: "21:30" },
          { day: 4, open: "11:30", close: "21:30" },
          { day: 5, open: "11:30", close: "22:30" },
          { day: 6, open: "11:30", close: "22:30" },
          { day: 0, open: "11:30", close: "21:30" },
        ],
        closedDays: [],
      },
      {
        id: "park2",
        name: "比治山公園",
        lat: 34.38123,
        lng: 132.43892,
        kind: "outdoor",
        category: "nature",
        createdAt: Date.now() - 1000 * 60 * 60 * 6,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 0, open: "06:00", close: "20:00" },
          { day: 1, open: "06:00", close: "20:00" },
          { day: 2, open: "06:00", close: "20:00" },
          { day: 3, open: "06:00", close: "20:00" },
          { day: 4, open: "06:00", close: "20:00" },
          { day: 5, open: "06:00", close: "20:00" },
          { day: 6, open: "06:00", close: "20:00" },
        ],
        closedDays: [],
      },
      {
        id: "fish1",
        name: "くぐ松",
        lat: 34.39845,
        lng: 132.45934,
        kind: "indoor",
        category: "food",
        createdAt: Date.now() - 1000 * 60 * 60 * 7,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 1, open: "11:00", close: "22:00" },
          { day: 2, open: "11:00", close: "22:00" },
          { day: 3, open: "11:00", close: "22:00" },
          { day: 4, open: "11:00", close: "22:00" },
          { day: 5, open: "11:00", close: "23:00" },
          { day: 6, open: "11:00", close: "23:00" },
          { day: 0, open: "11:00", close: "22:00" },
        ],
        closedDays: [],
      },
      {
        id: "museum2",
        name: "ヒロシマ原爆戦災資料館",
        lat: 34.39234,
        lng: 132.45623,
        kind: "indoor",
        category: "museum",
        createdAt: Date.now() - 1000 * 60 * 60 * 8,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 1, open: "09:00", close: "17:00" },
          { day: 2, open: "09:00", close: "17:00" },
          { day: 3, open: "09:00", close: "17:00" },
          { day: 4, open: "09:00", close: "17:00" },
          { day: 5, open: "09:00", close: "18:00" },
          { day: 6, open: "09:00", close: "18:00" },
          { day: 0, open: "09:00", close: "18:00" },
        ],
        closedDays: [],
      },
      {
        id: "bookstore1",
        name: "広島BOOKセンター",
        lat: 34.39512,
        lng: 132.46451,
        kind: "indoor",
        category: "shopping",
        createdAt: Date.now() - 1000 * 60 * 60 * 9,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 0, open: "10:00", close: "20:00" },
          { day: 1, open: "10:00", close: "20:00" },
          { day: 2, open: "10:00", close: "20:00" },
          { day: 3, open: "10:00", close: "20:00" },
          { day: 4, open: "10:00", close: "20:00" },
          { day: 5, open: "10:00", close: "21:00" },
          { day: 6, open: "10:00", close: "21:00" },
        ],
        closedDays: [],
      },
      {
        id: "garden1",
        name: "縮景園",
        lat: 34.40123,
        lng: 132.45212,
        kind: "outdoor",
        category: "nature",
        createdAt: Date.now() - 1000 * 60 * 60 * 10,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 0, open: "09:00", close: "17:00" },
          { day: 1, open: "09:00", close: "17:00" },
          { day: 2, open: "09:00", close: "17:00" },
          { day: 3, open: "09:00", close: "17:00" },
          { day: 4, open: "09:00", close: "17:00" },
          { day: 5, open: "09:00", close: "17:00" },
          { day: 6, open: "09:00", close: "17:00" },
        ],
        closedDays: [],
      },
      {
        id: "tower1",
        name: "ひろしまオリヅルタワー",
        lat: 34.39512,
        lng: 132.45289,
        kind: "indoor",
        category: "history",
        createdAt: Date.now() - 1000 * 60 * 60 * 12,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 0, open: "08:00", close: "19:00" },
          { day: 1, open: "08:00", close: "19:00" },
          { day: 2, open: "08:00", close: "19:00" },
          { day: 3, open: "08:00", close: "19:00" },
          { day: 4, open: "08:00", close: "19:00" },
          { day: 5, open: "08:00", close: "20:00" },
          { day: 6, open: "08:00", close: "20:00" },
        ],
        closedDays: [],
      },
      {
        id: "mitaki",
        name: "三瀧寺",
        lat: 34.37612,
        lng: 132.43892,
        kind: "outdoor",
        category: "shrine",
        createdAt: Date.now() - 1000 * 60 * 60 * 14,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 0, open: "09:00", close: "16:00" },
          { day: 1, open: "09:00", close: "16:00" },
          { day: 2, open: "09:00", close: "16:00" },
          { day: 3, open: "09:00", close: "16:00" },
          { day: 4, open: "09:00", close: "16:00" },
          { day: 5, open: "09:00", close: "16:00" },
          { day: 6, open: "09:00", close: "16:00" },
        ],
        closedDays: [],
      },
      {
        id: "yakiniku1",
        name: "焼肉 和牛樓",
        lat: 34.40156,
        lng: 132.46234,
        kind: "indoor",
        category: "food",
        createdAt: Date.now() - 1000 * 60 * 60 * 16,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 1, open: "17:00", close: "23:00" },
          { day: 2, open: "17:00", close: "23:00" },
          { day: 3, open: "17:00", close: "23:00" },
          { day: 4, open: "17:00", close: "23:00" },
          { day: 5, open: "17:00", close: "23:30" },
          { day: 6, open: "17:00", close: "23:30" },
          { day: 0, open: "17:00", close: "23:00" },
        ],
        closedDays: [],
      },
      {
        id: "flower1",
        name: "広島フラワーフェスティバル",
        lat: 34.39645,
        lng: 132.4534,
        kind: "outdoor",
        category: "nature",
        createdAt: Date.now() - 1000 * 60 * 60 * 18,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 0, open: "10:00", close: "18:00" },
          { day: 1, open: "10:00", close: "18:00" },
          { day: 2, open: "10:00", close: "18:00" },
          { day: 3, open: "10:00", close: "18:00" },
          { day: 4, open: "10:00", close: "18:00" },
          { day: 5, open: "10:00", close: "18:00" },
          { day: 6, open: "10:00", close: "18:00" },
        ],
        closedDays: [],
      },
      {
        id: "sushi1",
        name: "すし 清",
        lat: 34.39456,
        lng: 132.45945,
        kind: "indoor",
        category: "food",
        createdAt: Date.now() - 1000 * 60 * 60 * 20,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 1, open: "11:30", close: "22:00" },
          { day: 2, open: "11:30", close: "22:00" },
          { day: 3, open: "11:30", close: "22:00" },
          { day: 4, open: "11:30", close: "22:00" },
          { day: 5, open: "11:30", close: "23:00" },
          { day: 6, open: "11:30", close: "23:00" },
          { day: 0, open: "11:30", close: "22:00" },
        ],
        closedDays: [],
      },
      {
        id: "boutique1",
        name: "アナーキーグラッド",
        lat: 34.39678,
        lng: 132.46534,
        kind: "indoor",
        category: "shopping",
        createdAt: Date.now() - 1000 * 60 * 60 * 22,
        photos: [],
        comments: [],
        ratings: [],
        favorites: [],
        visited: [],
        openingHours: [
          { day: 0, open: "11:00", close: "20:00" },
          { day: 1, open: "11:00", close: "20:00" },
          { day: 2, open: "11:00", close: "20:00" },
          { day: 3, open: "11:00", close: "20:00" },
          { day: 4, open: "11:00", close: "20:00" },
          { day: 5, open: "11:00", close: "21:00" },
          { day: 6, open: "11:00", close: "21:00" },
        ],
        closedDays: [],
      },
    ],
    [],
  );

  const loadUserSpots = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const [spots, setSpots] = useState<Spot[]>(() => [
    ...initialSpots,
    ...loadUserSpots(),
  ]);
  const [focusedId, setFocusedId] = useState("dome");
  const focusedSpot = useMemo(
    () => spots.find((s) => s.id === focusedId) ?? spots[0],
    [spots, focusedId],
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      role: "ai",
      text: "広島へようこそ。今の滞在時間はどれくらいですか？",
    },
  ]);
  const [input, setInput] = useState("");
  const [showLogForm, setShowLogForm] = useState(false);
  const [logText, setLogText] = useState("");
  const [logPhoto, setLogPhoto] = useState<string | ArrayBuffer | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [username, setUsername] = useState(
    () => localStorage.getItem(USER_KEY) || "",
  );
  const [showLoginForm, setShowLoginForm] = useState(!username);
  const [addMode, setAddMode] = useState(false);
  const [newSpotPos, setNewSpotPos] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [commentTargetName, setCommentTargetName] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filterKind, setFilterKind] = useState<
    "all" | "indoor" | "outdoor" | "user"
  >("all");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "rating">(
    "newest",
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [weather, setWeather] = useState<Weather>({
    temp: 8,
    condition: "sunny",
    humidity: 65,
  });
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showVisitedOnly, setShowVisitedOnly] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [gallerySpot, setGallerySpot] = useState<Spot | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showRouteBuilder, setShowRouteBuilder] = useState(false);
  const [routeSpots, setRouteSpots] = useState<string[]>([]);

  useEffect(() => {
    fetch("https://system-k.vercel.app/weather.json")
      .then((res) => res.json())
      .then((data) => {
        setWeather({
          temp: data.temperature?.max ?? 8,
          condition:
            data.weather === "晴れ"
              ? "sunny"
              : data.weather === "曇り"
                ? "cloudy"
                : data.weather === "雨"
                  ? "rainy"
                  : "sunny",
          humidity: 65,
        });
      })
      .catch(() => {
        setWeather({ temp: 8, condition: "sunny", humidity: 65 });
      });
  }, []);

  const env = weather;

  const proposalsFor = (hours: number) => {
    if (env.temp >= 27 && hours <= 2) {
      return spots.filter((s) => s.kind === "indoor").slice(0, 2);
    }
    if (hours >= 3) {
      const mSpot = spots.find((s) => s.id === "miyajima");
      return mSpot ? [mSpot] : [];
    }
    return spots.slice(0, 2);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const newMsgs: Message[] = [
      ...messages,
      { id: crypto.randomUUID(), role: "user", text: trimmed },
    ];
    setMessages(newMsgs);

    const m = trimmed.match(/\d+/);
    const hours = m ? Math.max(1, Math.min(8, parseInt(m[0], 10))) : 2;

    const info = `現在の環境は ${env.temp}°C / 湿度 ${env.humidity}% です。${hours}時間で楽しめるおすすめはこちらです。`;
    const spotsProp = proposalsFor(hours);
    const suggestion = spotsProp.map((s) => `・${s.name}`).join("\n");

    const aiText = `${info}\n\n${env.temp >= 27 ? "現在は少し蒸し暑いため、涼しい室内で歴史を感じられるスポットを中心に。" : ""}\n${suggestion}`;
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "ai",
        text: aiText,
        proposals: spotsProp,
      },
    ]);
    setInput("");
  };

  const focusOn = (spotId: string) => {
    setFocusedId(spotId);
    const s = spots.find((sp) => sp.id === spotId);
    if (s && mapRef.current) {
      mapRef.current.flyTo([s.lat, s.lng], 15, { duration: 0.6 });
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "ai",
          text: `${s.name} を地図で表示しました。`,
        },
      ]);
    }
  };

  const commentOnSpot = (spot: Spot) => {
    setFocusedId(spot.id);
    if (mapRef.current) {
      mapRef.current.flyTo([spot.lat, spot.lng], 15, { duration: 0.6 });
    }
    setNewSpotPos({ lat: spot.lat, lng: spot.lng });
    setCommentTargetName(spot.name);
    setLogText("");
    setLogPhoto(null);
    setShowLogForm(true);
    setAddMode(false);
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e?.preventDefault();

    if (commentTargetName && newSpotPos) {
      const targetSpot = spots.find(
        (s) => s.lat === newSpotPos.lat && s.lng === newSpotPos.lng,
      );
      if (targetSpot && logText.trim()) {
        const newComment: Comment = {
          id: crypto.randomUUID(),
          username,
          text: logText.trim().slice(0, 100),
          createdAt: Date.now(),
        };
        setSpots((prev) => {
          const updated = prev.map((s) =>
            s.id === targetSpot.id
              ? { ...s, comments: [...(s.comments || []), newComment] }
              : s,
          );
          const userSpots = updated.filter((s) => s.kind === "user");
          localStorage.setItem(STORAGE_KEY, JSON.stringify(userSpots));
          return updated;
        });
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "ai",
            text: `${commentTargetName}にコメントを追加しました。`,
          },
        ]);
      }
      setShowLogForm(false);
      setLogText("");
      setLogPhoto(null);
      setNewSpotPos(null);
      setCommentTargetName(null);
      return;
    }

    const id = crypto.randomUUID();
    const base = newSpotPos ||
      focusedSpot || { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] };
    const jitterLat = newSpotPos ? 0 : Math.random() * 0.018 - 0.009;
    const jitterLng = newSpotPos ? 0 : Math.random() * 0.018 - 0.009;
    const newSpot: Spot = {
      id,
      name: logText?.trim()
        ? logText.trim().slice(0, 20)
        : "ユーザ投稿スポット",
      lat: base.lat + jitterLat,
      lng: base.lng + jitterLng,
      kind: "user",
      category: "other",
      createdAt: Date.now(),
      photos: logPhoto ? [logPhoto as string] : [],
      comments: [],
      ratings: [],
      favorites: [],
      visited: [],
    };
    setSpots((prev) => {
      const updated = [newSpot, ...prev];
      const userSpots = updated.filter((s) => s.kind === "user");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userSpots));
      return updated;
    });
    setFocusedId(id);
    if (mapRef.current) {
      mapRef.current.flyTo([newSpot.lat, newSpot.lng], 15, { duration: 0.6 });
    }
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "ai",
        text: "投稿を記録しました。ピンを地図に追加しました。",
      },
    ]);
    setShowLogForm(false);
    setLogText("");
    setLogPhoto(null);
    setNewSpotPos(null);
    setCommentTargetName(null);
  };

  const onPhotoChange = (file: File | undefined) => {
    if (!file) {
      setLogPhoto(null);
      return;
    }
    const fr = new FileReader();
    fr.onload = () => setLogPhoto(fr.result);
    fr.readAsDataURL(file);
  };

  const handleLogin = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem(USER_KEY, trimmed);
    setUsername(trimmed);
    setShowLoginForm(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(USER_KEY);
    setUsername("");
    setShowLoginForm(true);
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!addMode) return;
    setNewSpotPos({ lat: e.latlng.lat, lng: e.latlng.lng });
    setCommentTargetName(null);
    setShowLogForm(true);
    setAddMode(false);
  };

  const calcDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getAvgRating = (spot: Spot) => {
    if (!spot.ratings?.length) return 0;
    return (
      spot.ratings.reduce((sum, r) => sum + r.score, 0) / spot.ratings.length
    );
  };

  const handleRate = (spotId: string, score: number) => {
    if (!username) return;
    setSpots((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== spotId) return s;
        const ratings = s.ratings || [];
        const existingIdx = ratings.findIndex((r) => r.userId === username);
        const newRatings =
          existingIdx >= 0
            ? ratings.map((r, i) =>
                i === existingIdx ? { userId: username, score } : r,
              )
            : [...ratings, { userId: username, score }];
        return { ...s, ratings: newRatings };
      });
      const userSpots = updated.filter((s) => s.kind === "user");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userSpots));
      return updated;
    });
  };

  const toggleFavorite = (spotId: string) => {
    if (!username) return;
    setSpots((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== spotId) return s;
        const favorites = s.favorites || [];
        const newFavorites = favorites.includes(username)
          ? favorites.filter((u) => u !== username)
          : [...favorites, username];
        return { ...s, favorites: newFavorites };
      });
      const userSpots = updated.filter((s) => s.kind === "user");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userSpots));
      return updated;
    });
  };

  const toggleVisited = (spotId: string) => {
    if (!username) return;
    setSpots((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== spotId) return s;
        const visited = s.visited || [];
        const newVisited = visited.includes(username)
          ? visited.filter((u) => u !== username)
          : [...visited, username];
        return { ...s, visited: newVisited };
      });
      const userSpots = updated.filter((s) => s.kind === "user");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userSpots));
      return updated;
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("お使いのブラウザは位置情報に対応していません");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);
        if (mapRef.current) {
          mapRef.current.flyTo([loc.lat, loc.lng], 14, { duration: 0.6 });
        }
      },
      (error) => {
        alert("位置情報の取得に失敗しました: " + error.message);
      },
    );
  };

  const filteredSpots = useMemo(() => {
    let result = spots;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (filterKind !== "all") {
      result = result.filter((s) => s.kind === filterKind);
    }
    if (selectedCategory !== "all") {
      result = result.filter((s) => s.category === selectedCategory);
    }
    if (showFavoritesOnly && username) {
      result = result.filter((s) => s.favorites?.includes(username));
    }
    if (showVisitedOnly && username) {
      result = result.filter((s) => s.visited?.includes(username));
    }
    if (sortBy === "popular") {
      result = [...result].sort(
        (a, b) => (b.comments?.length || 0) - (a.comments?.length || 0),
      );
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => getAvgRating(b) - getAvgRating(a));
    } else {
      result = [...result].sort((a, b) => b.createdAt - a.createdAt);
    }
    return result;
  }, [
    spots,
    searchQuery,
    filterKind,
    selectedCategory,
    showFavoritesOnly,
    showVisitedOnly,
    sortBy,
    username,
  ]);

  const labelForKind = (kind: string) => {
    if (kind === "indoor") return "屋内";
    if (kind === "outdoor") return "屋外";
    return "ユーザ";
  };

  const labelForCategory = (c?: string) => {
    if (c === "food") return "🍴 グルメ";
    if (c === "shopping") return "🛍️ ショッピング";
    if (c === "history") return "🏯 歴史";
    if (c === "nature") return "🌳 自然";
    if (c === "museum") return "🏛️ 美術館";
    if (c === "shrine") return "⛩️ 神社仏閣";
    return "📍 その他";
  };

  const isOpenNow = (spot: Spot) => {
    if (!spot.openingHours || spot.openingHours.length === 0) return null;
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    if (spot.closedDays?.includes(day)) return false;

    const todayHours = spot.openingHours.find((h) => h.day === day);
    if (!todayHours) return false;

    const [openH, openM] = todayHours.open.split(":").map(Number);
    const [closeH, closeM] = todayHours.close.split(":").map(Number);
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;

    return currentTime >= openTime && currentTime < closeTime;
  };

  const getWeatherIcon = () => {
    if (weather.condition === "sunny") return "☀️";
    if (weather.condition === "cloudy") return "☁️";
    return "🌧️";
  };

  const shareSpot = (spot: Spot) => {
    const url = `${window.location.origin}${window.location.pathname}?spot=${spot.id}`;
    const text = `${spot.name} - Hiromapで見つけたスポット！`;
    if (navigator.share) {
      navigator.share({ title: spot.name, text, url });
    } else {
      navigator.clipboard.writeText(url);
      alert("リンクをコピーしました！");
    }
  };

  const buildRoute = () => {
    const selectedSpots = spots.filter((s) => routeSpots.includes(s.id));
    if (selectedSpots.length < 2) return;

    const points: RoutePoint[] = selectedSpots.map((s) => [s.lat, s.lng]);
    setRoutePoints(points);

    if (mapRef.current && selectedSpots.length > 0) {
      const bounds = L.latLngBounds(points);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    const distance = selectedSpots.reduce((acc, spot, i) => {
      if (i === 0) return 0;
      const prev = selectedSpots[i - 1];
      return acc + calcDistance(prev.lat, prev.lng, spot.lat, spot.lng);
    }, 0);

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "ai",
        text: `${selectedSpots.length}個のスポットを結ぶルートを作成しました。\n総距離: 約${distance.toFixed(1)}km`,
      },
    ]);
  };

  const toggleLike = (spotId: string, commentId: string) => {
    if (!username) return;
    setSpots((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== spotId) return s;
        const comments = (s.comments || []).map((c) => {
          if (c.id !== commentId) return c;
          const likes = c.likes || [];
          const newLikes = likes.includes(username)
            ? likes.filter((u) => u !== username)
            : [...likes, username];
          return { ...c, likes: newLikes };
        });
        return { ...s, comments };
      });
      const userSpots = updated.filter((s) => s.kind === "user");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userSpots));
      return updated;
    });
  };

  const addReply = (spotId: string, commentId: string) => {
    if (!username || !replyText.trim()) return;
    const newReply: CommentReply = {
      id: crypto.randomUUID(),
      username,
      text: replyText.trim(),
      createdAt: Date.now(),
    };
    setSpots((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== spotId) return s;
        const comments = (s.comments || []).map((c) => {
          if (c.id !== commentId) return c;
          return { ...c, replies: [...(c.replies || []), newReply] };
        });
        return { ...s, comments };
      });
      const userSpots = updated.filter((s) => s.kind === "user");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userSpots));
      return updated;
    });
    setReplyText("");
    setReplyingTo(null);
  };

  return (
    <div className="min-h-screen w-full bg-neutral-100 text-neutral-800">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center gap-1 md:gap-2 px-2 md:px-4 py-3 bg-white border-b border-neutral-200 shadow-sm overflow-x-auto">
        <Sparkles className="text-amber-500 flex-shrink-0" />
        <h1 className="font-semibold text-sm md:text-base">Hiromap</h1>
        {username && (
          <span className="text-xs md:text-sm text-neutral-600 ml-2 hidden sm:inline">
            ようこそ、{username}さん
          </span>
        )}
        <div className="hidden md:flex ml-2 items-center gap-1 text-xs bg-blue-50 px-2 py-1 rounded">
          <span>{getWeatherIcon()}</span>
          <span>{weather.temp}°C</span>
          <span className="text-neutral-500">{weather.humidity}%</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {username && (
            <>
              <button
                onClick={() => setShowRouteBuilder(!showRouteBuilder)}
                className="rounded-md border border-neutral-300 p-1.5 md:p-2 hover:bg-neutral-100"
                title="ルート作成"
              >
                <Route size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
              <button
                onClick={getCurrentLocation}
                className="inline-flex items-center rounded-md p-1.5 md:px-3 md:py-1.5 text-sm border border-neutral-300 hover:bg-neutral-100"
                title="現在地を表示"
              >
                <Navigation size={16} />
              </button>
              <button
                onClick={() => setShowSearch((v) => !v)}
                className={`inline-flex items-center rounded-md p-1.5 md:px-3 md:py-1.5 text-sm ${
                  showSearch
                    ? "bg-blue-500 text-white"
                    : "border border-neutral-300 hover:bg-neutral-100"
                }`}
                title="検索・フィルター"
              >
                <Search size={16} />
              </button>
              <button
                onClick={() => setAddMode((v) => !v)}
                className={`inline-flex items-center gap-1 rounded-md p-1.5 md:px-3 md:py-1.5 text-sm ${
                  addMode
                    ? "bg-amber-500 text-white"
                    : "border border-neutral-300 hover:bg-neutral-100"
                }`}
                title="マップをクリックして新規スポット追加"
              >
                <MapPinIcon size={16} />{" "}
                <span className="hidden md:inline">
                  {addMode ? "追加中" : "追加"}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="rounded-md p-1.5 md:px-3 md:py-1.5 text-sm border border-neutral-300 hover:bg-neutral-100"
                title="ログアウト"
              >
                <span className="hidden md:inline">ログアウト</span>
                <span className="md:hidden text-xs">🚪</span>
              </button>
            </>
          )}
          <button
            onClick={() => setShowChat((v) => !v)}
            className="rounded-md px-2 md:px-3 py-1.5 text-sm border border-neutral-300 hover:bg-neutral-100 flex-shrink-0"
            title="チャットパネルの表示切り替え"
          >
            {showChat ? "💬✕" : "💬"}
          </button>
        </div>
      </header>

      <main className="relative pt-14 h-[calc(100vh-56px)]">
        {showSearch && (
          <div className="absolute top-4 left-4 right-4 md:right-auto z-30 bg-white rounded-xl shadow-lg border border-neutral-200 p-4 w-full md:w-80 space-y-3 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">検索・フィルター</h3>
              <button
                onClick={() => setShowSearch(false)}
                className="p-1 hover:bg-neutral-100 rounded"
              >
                <X size={16} />
              </button>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="スポット名で検索..."
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div>
              <label className="text-xs font-medium text-neutral-600">
                種別
              </label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {(["all", "indoor", "outdoor", "user"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setFilterKind(k)}
                    className={`px-2 py-1 text-xs rounded ${
                      filterKind === k
                        ? "bg-blue-500 text-white"
                        : "bg-neutral-100"
                    }`}
                  >
                    {k === "all" ? "すべて" : labelForKind(k)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600">
                カテゴリ
              </label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {(
                  [
                    "all",
                    "food",
                    "shopping",
                    "history",
                    "nature",
                    "museum",
                    "shrine",
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedCategory === cat
                        ? "bg-emerald-500 text-white"
                        : "bg-neutral-100"
                    }`}
                  >
                    {cat === "all" ? "すべて" : labelForCategory(cat)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                  className="rounded"
                />
                ⭐ お気に入りのみ
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={showVisitedOnly}
                  onChange={(e) => setShowVisitedOnly(e.target.checked)}
                  className="rounded"
                />
                ✅ 訪問済みのみ
              </label>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-600">
                並び順
              </label>
              <div className="flex gap-2 mt-1">
                {(
                  [
                    { value: "newest", label: "新着順" },
                    { value: "popular", label: "人気順" },
                    { value: "rating", label: "評価順" },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSortBy(s.value)}
                    className={`px-2 py-1 text-xs rounded ${
                      sortBy === s.value
                        ? "bg-blue-500 text-white"
                        : "bg-neutral-100"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          className="absolute inset-0 z-10"
          scrollWheelZoom
          ref={mapRef}
        >
          <MapClickHandler onClick={handleMapClick} />
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={L.divIcon({
                className: "current-location-marker",
                html: '<div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })}
            >
              <Popup>
                <div className="text-sm font-medium">現在地</div>
              </Popup>
            </Marker>
          )}
          {routePoints.length > 1 && (
            <Polyline
              positions={routePoints}
              color="#10b981"
              weight={3}
              opacity={0.7}
            />
          )}
          {filteredSpots.map((s) => {
            const avgRating = getAvgRating(s);
            const isFavorite = s.favorites?.includes(username) || false;
            const isVisited = s.visited?.includes(username) || false;
            const distance = userLocation
              ? calcDistance(userLocation.lat, userLocation.lng, s.lat, s.lng)
              : null;
            return (
              <Marker
                key={s.id}
                position={[s.lat, s.lng]}
                icon={pinIcon}
                eventHandlers={{ click: () => focusOn(s.id) }}
              >
                <Popup>
                  <div className="space-y-2 max-w-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm">{s.name}</div>
                        {s.category && (
                          <div className="text-xs text-neutral-500 mt-0.5">
                            {labelForCategory(s.category)}
                          </div>
                        )}
                      </div>
                      {isVisited && (
                        <Check
                          size={16}
                          className="text-green-600 flex-shrink-0"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-600 flex-wrap">
                      <span>種別: {labelForKind(s.kind)}</span>
                      {distance !== null && (
                        <span className="text-blue-600">
                          📍 {distance.toFixed(1)}km
                        </span>
                      )}
                      {(() => {
                        const open = isOpenNow(s);
                        if (open === null) return null;
                        return open ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <Clock size={12} /> 営業中
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1">
                            <Clock size={12} /> 営業時間外
                          </span>
                        );
                      })()}
                    </div>
                    {username && (
                      <div className="flex items-center gap-1 pt-1">
                        {[1, 2, 3, 4, 5].map((score) => {
                          const userRating = s.ratings?.find(
                            (r) => r.userId === username,
                          );
                          const isActive = userRating
                            ? score <= userRating.score
                            : false;
                          return (
                            <button
                              key={score}
                              onClick={() => handleRate(s.id, score)}
                            >
                              <Star
                                size={16}
                                className={
                                  isActive
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-neutral-300"
                                }
                              />
                            </button>
                          );
                        })}
                        {avgRating > 0 && (
                          <span className="text-xs text-neutral-600 ml-1">
                            {avgRating.toFixed(1)} ({s.ratings?.length || 0})
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => focusOn(s.id)}
                        className="flex-1 rounded-md bg-emerald-600 text-white px-2 py-1 text-xs"
                      >
                        フォーカス
                      </button>
                      {username && (
                        <>
                          <button
                            onClick={() => shareSpot(s)}
                            className="rounded-md px-2 py-1 text-xs border border-neutral-300 hover:bg-neutral-100"
                            title="共有"
                          >
                            <Share2 size={14} />
                          </button>
                          <button
                            onClick={() => toggleFavorite(s.id)}
                            className={`rounded-md px-2 py-1 text-xs ${isFavorite ? "bg-pink-100 text-pink-600" : "border"}`}
                          >
                            <Heart
                              size={14}
                              className={isFavorite ? "fill-pink-600" : ""}
                            />
                          </button>
                          <button
                            onClick={() => toggleVisited(s.id)}
                            className={`rounded-md px-2 py-1 text-xs ${isVisited ? "bg-green-100 text-green-600" : "border"}`}
                          >
                            <Check size={14} />
                          </button>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => commentOnSpot(s)}
                      className="rounded-md border px-2 py-1 text-xs w-full text-left"
                    >
                      コメントを追加
                    </button>
                    {s.comments && s.comments.length > 0 && (
                      <div className="mt-3 pt-2 border-t space-y-3">
                        <div className="text-xs font-semibold text-neutral-600">
                          💬 コメント
                        </div>
                        {s.comments.map((c) => (
                          <div key={c.id} className="space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="font-medium text-xs text-neutral-700">
                                  {c.username}
                                </div>
                                <div className="text-xs text-neutral-800 mt-1">
                                  {c.text}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                                  <span>
                                    {new Date(c.createdAt).toLocaleDateString(
                                      "ja-JP",
                                      {
                                        month: "2-digit",
                                        day: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </span>
                                  {username && (
                                    <>
                                      <button
                                        onClick={() => toggleLike(s.id, c.id)}
                                        className="flex items-center gap-1 hover:text-emerald-600"
                                      >
                                        <ThumbsUp
                                          size={12}
                                          className={
                                            c.likes?.includes(username)
                                              ? "fill-emerald-600 text-emerald-600"
                                              : ""
                                          }
                                        />
                                        {c.likes?.length || 0}
                                      </button>
                                      <button
                                        onClick={() =>
                                          setReplyingTo(
                                            replyingTo === c.id ? null : c.id,
                                          )
                                        }
                                        className="flex items-center gap-1 hover:text-blue-600"
                                      >
                                        <MessageSquare size={12} />
                                        返信
                                      </button>
                                    </>
                                  )}
                                </div>
                                {c.replies && c.replies.length > 0 && (
                                  <div className="ml-4 mt-2 space-y-1 border-l-2 border-neutral-200 pl-2">
                                    {c.replies.map((r) => (
                                      <div key={r.id} className="text-xs">
                                        <span className="font-medium text-neutral-700">
                                          {r.username}:
                                        </span>
                                        <span className="text-neutral-600 ml-1">
                                          {r.text}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {replyingTo === c.id && (
                                  <div className="mt-2 flex gap-1">
                                    <input
                                      value={replyText}
                                      onChange={(e) =>
                                        setReplyText(e.target.value)
                                      }
                                      placeholder="返信を入力..."
                                      className="flex-1 rounded border px-2 py-1 text-xs"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault();
                                          addReply(s.id, c.id);
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={() => addReply(s.id, c.id)}
                                      className="rounded bg-emerald-600 text-white px-2 py-1 text-xs"
                                    >
                                      送信
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {s.photos && s.photos.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold text-neutral-600 mb-1">
                          📷 写真
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {s.photos.slice(0, 4).map((photo, idx) => (
                            <img
                              key={idx}
                              src={photo}
                              alt={s.name}
                              className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                              onClick={() => {
                                setGallerySpot(s);
                                setShowGallery(true);
                              }}
                            />
                          ))}
                        </div>
                        {s.photos.length > 4 && (
                          <button
                            onClick={() => {
                              setGallerySpot(s);
                              setShowGallery(true);
                            }}
                            className="text-xs text-blue-600 mt-1"
                          >
                            他 {s.photos.length - 4} 枚を見る
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        <section
          className={`pointer-events-none absolute left-0 right-0 bottom-0 z-20 transition-opacity duration-200 ${showChat ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <div className="mx-auto max-w-3xl p-4 pointer-events-auto">
            <div className="rounded-xl border border-neutral-200 bg-white/85 backdrop-blur shadow">
              <div className="max-h-64 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`text-sm ${m.role === "ai" ? "" : "text-right"}`}
                  >
                    <p
                      className={`inline-block rounded-2xl px-3 py-2 ${m.role === "ai" ? "bg-neutral-100" : "bg-emerald-600 text-white"}`}
                    >
                      {m.text}
                    </p>
                    {m.proposals?.length ? (
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
                        {m.proposals.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => focusOn(p.id)}
                            className="rounded-lg border bg-white p-2 hover:border-emerald-400"
                          >
                            <div className="font-medium text-xs">{p.name}</div>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              <form
                className="flex items-center gap-2 border-t p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="例: 2時間くらい"
                  className="flex-1 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                />
                <button
                  type="submit"
                  className="rounded-md bg-emerald-600 text-white px-3 py-2 text-sm"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </section>

        {showRouteBuilder && (
          <div className="absolute top-20 left-4 right-4 md:right-auto z-30 bg-white rounded-xl shadow-lg border p-4 w-full md:w-80 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Route size={16} />
                ルート作成
              </h3>
              <button
                onClick={() => setShowRouteBuilder(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {spots.slice(0, 10).map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-neutral-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={routeSpots.includes(s.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRouteSpots([...routeSpots, s.id]);
                      } else {
                        setRouteSpots(routeSpots.filter((id) => id !== s.id));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="flex-1">{s.name}</span>
                  {s.category && (
                    <span className="text-xs">
                      {labelForCategory(s.category)}
                    </span>
                  )}
                </label>
              ))}
            </div>
            <button
              onClick={buildRoute}
              disabled={routeSpots.length < 2}
              className="w-full mt-3 rounded-md bg-emerald-600 text-white px-3 py-2 text-sm disabled:bg-neutral-300"
            >
              ルートを作成 ({routeSpots.length}個選択中)
            </button>
            {routePoints.length > 0 && (
              <button
                onClick={() => {
                  setRoutePoints([]);
                  setRouteSpots([]);
                }}
                className="w-full mt-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
              >
                ルートをクリア
              </button>
            )}
          </div>
        )}

        {showLogForm && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 p-4">
            <form
              onSubmit={handleLogSubmit}
              className="w-full max-w-lg rounded-xl bg-white p-4 space-y-3 shadow-xl"
            >
              <div className="text-sm font-medium">
                {commentTargetName
                  ? `${commentTargetName}にコメント`
                  : "新しい場所を追加"}
              </div>
              <textarea
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
                placeholder="メモを入力..."
                className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="px-3 py-1.5 text-sm border rounded"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded"
                >
                  投稿
                </button>
              </div>
            </form>
          </div>
        )}

        {showGallery && gallerySpot && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-4xl bg-white rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  {gallerySpot.name} の写真
                </h3>
                <button
                  onClick={() => {
                    setShowGallery(false);
                    setGallerySpot(null);
                  }}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {gallerySpot.photos?.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`${gallerySpot.name} ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {showLoginForm && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 space-y-4 shadow-2xl text-center">
              <Sparkles className="text-amber-500 mx-auto" size={32} />
              <h2 className="text-lg font-semibold">HiroMapへようこそ</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (
                    e.currentTarget.elements.namedItem(
                      "username",
                    ) as HTMLInputElement
                  ).value;
                  handleLogin(input);
                }}
                className="space-y-3"
              >
                <input
                  name="username"
                  type="text"
                  placeholder="ニックネーム"
                  className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full rounded-md bg-emerald-600 text-white py-2 text-sm font-medium"
                >
                  はじめる
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
