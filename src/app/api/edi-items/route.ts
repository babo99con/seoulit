import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://apis.data.go.kr/B551182/mdfeeCrtrInfoService";

const ENDPOINTS: Record<string, string[]> = {
  pharmacy: ["getPharmacyMdfeeList", "getPharmacyMfeeList"],
  cmcd: ["getCmdcMdfeeList", "getCmcdMdfeeList", "getCmcdMfeeList"],
  diagnoss: ["getDiagnossMdfeeList", "getDiagnossMfeeList"],
};

const getField = (obj: Record<string, unknown>, key: string) => {
  if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key];
  const lower = key.toLowerCase();
  const foundKey = Object.keys(obj).find((k) => k.toLowerCase() === lower);
  return foundKey ? obj[foundKey] : undefined;
};

const pickText = (obj: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = getField(obj, key);
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
};

const pickTextByPattern = (obj: Record<string, unknown>, patterns: RegExp[]) => {
  for (const key of Object.keys(obj)) {
    if (!patterns.some((p) => p.test(key))) continue;
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
};

const pickNum = (obj: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = getField(obj, key);
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value.replace(/,/g, ""));
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return 0;
};

export async function GET(req: NextRequest) {
  const serviceKey = process.env.EDI_SERVICE_KEY || process.env.NEXT_PUBLIC_EDI_SERVICE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ success: false, message: "EDI 서비스키가 설정되지 않았습니다." }, { status: 500 });
  }

  const sp = req.nextUrl.searchParams;
  const kind = (sp.get("kind") || "pharmacy").toLowerCase();
  const endpoints = ENDPOINTS[kind] || ENDPOINTS.pharmacy;

  const pageNo = sp.get("pageNo") || "1";
  const numOfRows = sp.get("numOfRows") || "30";
  const numKeys = kind === "pharmacy" ? ["numOfRow", "numOfRows"] : ["numOfRows", "numOfRow"];
  const passKeys = ["mdfeeCd", "mdfeeDivNo", "korNm", "unprc3", "unprc4", "unprc5", "unprc6"];

  let text = "";
  let okEndpoint = "";
  let okStatus = 500;

  for (const endpoint of endpoints) {
    const variants: URLSearchParams[] = [];
    const p1 = new URLSearchParams({ ServiceKey: serviceKey, pageNo, _type: "json" });
    p1.set(numKeys[0], numOfRows);
    const p2 = new URLSearchParams({ serviceKey, pageNo, _type: "json" });
    p2.set(numKeys[0], numOfRows);
    const p3 = new URLSearchParams({ ServiceKey: serviceKey, pageNo });
    p3.set(numKeys[1], numOfRows);
    const p4 = new URLSearchParams({ serviceKey, pageNo });
    p4.set(numKeys[1], numOfRows);
    variants.push(p1, p2, p3, p4);
    for (const params of variants) {
      for (const key of passKeys) {
        const value = sp.get(key);
        if (value) params.set(key, value);
      }
      if (kind === "diagnoss") {
        if (!params.get("unprc3")) params.set("unprc3", "0");
        if (!params.get("unprc4")) params.set("unprc4", "0");
        if (!params.get("unprc5")) params.set("unprc5", "0");
        if (!params.get("unprc6")) params.set("unprc6", "0");
      }
      const url = `${BASE_URL}/${endpoint}?${params.toString()}`;
      const res = await fetch(url, { cache: "no-store" });
      const buf = await res.arrayBuffer();
      const utf8 = new TextDecoder("utf-8").decode(buf);
      if (utf8.includes("�")) {
        try {
          text = new TextDecoder("euc-kr").decode(buf);
        } catch {
          text = utf8;
        }
      } else {
        text = utf8;
      }
      okStatus = res.status;
      if (res.ok) {
        okEndpoint = endpoint;
        break;
      }
    }
    if (okEndpoint) break;
  }

  if (!okEndpoint) {
    return NextResponse.json({ success: false, message: `공공 API 호출 실패(${okStatus})`, raw: text.slice(0, 600) }, { status: 502 });
  }

  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    return NextResponse.json({ success: false, message: "JSON 파싱 실패", raw: text.slice(0, 300) }, { status: 502 });
  }

  const body = json?.response?.body;
  const item = body?.items?.item;
  const rows: Record<string, unknown>[] = Array.isArray(item) ? item : item ? [item] : [];
  const items = rows.map((row, idx) => ({
    id: idx + 1,
    code:
      pickText(row, ["mdfeeCd", "mdfeecd", "sugaCode", "edicode", "code", "itemCode"]) ||
      pickTextByPattern(row, [/mdfee.*cd/i, /suga.*code/i, /edi.*code/i, /(^|_)code$/i]),
    name:
      pickText(row, ["korNm", "sugaName", "itemName", "name"]) ||
      pickTextByPattern(row, [/kor.*nm/i, /name/i, /nm$/i]),
    divNo:
      pickText(row, ["mdfeeDivNo", "divNo", "groupNo"]) ||
      pickTextByPattern(row, [/mdfee.*div/i, /div.*no/i, /group.*no/i]),
    unitPrice: pickNum(row, ["unprc", "unprc1", "unprc2", "unprc3", "unprc4", "unprc5", "unprc6", "amt", "price", "unitPrice"]),
    applyDate: pickText(row, ["adtStaDd", "aplyStDt", "effectiveFrom", "applyDate", "pubDate"]),
    raw: row,
  }));

  return NextResponse.json({
    success: true,
    result: {
      endpoint: okEndpoint,
      totalCount: Number(body?.totalCount || items.length || 0),
      pageNo: Number(body?.pageNo || 1),
      numOfRows: Number(body?.numOfRows || items.length || 0),
      items,
    },
  });
}
