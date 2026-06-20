import { NextResponse } from "next/server";
import { getAdminCookieName, isAdminSession } from "../../../lib/admin-auth";
import { getAdminDashboard, isDatabaseConfigured } from "../../../lib/database";

export async function GET(request: Request) {
  if (!isAdminSession(request.headers.get("cookie")?.match(new RegExp(`${getAdminCookieName()}=([^;]+)`))?.[1])) {
    return NextResponse.json({ message: "Требуется вход." }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ message: "База данных пока не подключена." }, { status: 503 });
  }

  const dashboard = await getAdminDashboard();

  return NextResponse.json(dashboard);
}
