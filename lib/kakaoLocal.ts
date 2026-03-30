const KAKAO_REST_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_KEY || "";

export interface Hospital {
  id: string;
  name: string;
  category: string;
  phone: string;
  address: string;
  roadAddress: string;
  distance: number; // meters
  latitude: number;
  longitude: number;
  placeUrl: string; // 카카오맵 링크 (리뷰 확인용)
}

export async function searchNearbyHospitals(
  latitude: number,
  longitude: number,
  radius: number = 3000 // 3km
): Promise<{ hospitals: Hospital[]; error: string | null }> {
  if (!KAKAO_REST_KEY) {
    // 데모 데이터 반환
    return { hospitals: getDemoHospitals(), error: null };
  }

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=산부인과&x=${longitude}&y=${latitude}&radius=${radius}&sort=distance`,
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API 요청 실패");
    }

    const hospitals: Hospital[] = data.documents.map((doc: any) => ({
      id: doc.id,
      name: doc.place_name,
      category: doc.category_name,
      phone: doc.phone || "전화번호 없음",
      address: doc.address_name,
      roadAddress: doc.road_address_name || doc.address_name,
      distance: parseInt(doc.distance),
      latitude: parseFloat(doc.y),
      longitude: parseFloat(doc.x),
      placeUrl: doc.place_url,
    }));

    return { hospitals, error: null };
  } catch (error: any) {
    console.error("Kakao API error:", error);
    return { hospitals: [], error: error.message };
  }
}

function getDemoHospitals(): Hospital[] {
  return [
    {
      id: "demo-1",
      name: "미래여성병원",
      category: "의료,건강 > 병원 > 산부인과",
      phone: "02-1234-5678",
      address: "서울 강남구 역삼동 123-45",
      roadAddress: "서울 강남구 테헤란로 123",
      distance: 350,
      latitude: 37.5012,
      longitude: 127.0396,
      placeUrl: "https://place.map.kakao.com/12345",
    },
    {
      id: "demo-2",
      name: "행복산부인과의원",
      category: "의료,건강 > 병원 > 산부인과",
      phone: "02-2345-6789",
      address: "서울 강남구 삼성동 67-89",
      roadAddress: "서울 강남구 삼성로 456",
      distance: 780,
      latitude: 37.5089,
      longitude: 127.0432,
      placeUrl: "https://place.map.kakao.com/23456",
    },
    {
      id: "demo-3",
      name: "서울마리아병원",
      category: "의료,건강 > 병원 > 산부인과",
      phone: "02-3456-7890",
      address: "서울 강남구 대치동 100-20",
      roadAddress: "서울 강남구 대치로 789",
      distance: 1200,
      latitude: 37.4945,
      longitude: 127.0567,
      placeUrl: "https://place.map.kakao.com/34567",
    },
    {
      id: "demo-4",
      name: "아이러브산부인과",
      category: "의료,건강 > 병원 > 산부인과",
      phone: "02-4567-8901",
      address: "서울 서초구 서초동 200-30",
      roadAddress: "서울 서초구 서초대로 321",
      distance: 1800,
      latitude: 37.4912,
      longitude: 127.0234,
      placeUrl: "https://place.map.kakao.com/45678",
    },
    {
      id: "demo-5",
      name: "제일여성병원",
      category: "의료,건강 > 병원 > 산부인과",
      phone: "02-5678-9012",
      address: "서울 강남구 논현동 50-10",
      roadAddress: "서울 강남구 논현로 654",
      distance: 2300,
      latitude: 37.5134,
      longitude: 127.0289,
      placeUrl: "https://place.map.kakao.com/56789",
    },
    {
      id: "demo-6",
      name: "예쁜맘산부인과",
      category: "의료,건강 > 병원 > 산부인과",
      phone: "02-6789-0123",
      address: "서울 송파구 잠실동 300-40",
      roadAddress: "서울 송파구 잠실로 987",
      distance: 2900,
      latitude: 37.5056,
      longitude: 127.0812,
      placeUrl: "https://place.map.kakao.com/67890",
    },
  ];
}
