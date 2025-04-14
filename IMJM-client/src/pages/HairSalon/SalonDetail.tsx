import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// import axios from 'axios';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import salon1Image from "../../assets/images/salon1.jpeg";
import salon2Image from "../../assets/images/salon2.png";
import salon3Image from "../../assets/images/salon3.png";
import hair1Image from "../../assets/images/hair1.png";
import hair2Image from "../../assets/images/hair2.png";
import salonData from "../../data/salon.json";
import stylistData from "../../data/stylist.json";
import serviceMenuData from "../../data/service_menu.json";
import reviewData from "../../data/review.json";
import reviewPhotoData from "../../data/review_photos.json";
import userData from "../../data/user.json";

import './SalonDetail.css';


// 네이버 맵 타입 정의
declare global {
    interface Window {
        naver: any;
    }
}

// 인터페이스 정의
interface SalonPhoto {
    photoId: number;
    photoUrl: string;
    photoOrder: number;
}

interface BusinessHour {
    day: string;
    open: string;
    close: string;
}

interface Salon {
    id: string;
    name: string;
    address: string;
    call_number: string;
    introduction: string;
    holiday_mask: number;
    start_time: string;
    end_time: string;
    score: number;
    latitude: number;
    longitude: number;
    photoUrl: string;
    detail_address?: string; // detail_address 추가
    // 추가로 사용하는 속성
    likes?: number;
    photos: SalonPhoto[];
    businessHours?: BusinessHour[];
    distance?: number;
}

interface Stylist {
    stylist_id: number;
    name: string;
    salon_id: number | string;
    introduction?: string;
}

interface ReviewPhoto {
    photo_id: number;
    review_id: number;
    photo_url: string;
    photo_order: number;
    upload_date: string;
}

interface Review {
    id: number;
    user_id: string;
    salon_id: string;
    reg_date: string;
    score: number;
    content: string;
    review_tag: string;
    reservation_id: number;
    // 추가 속성
    photos?: ReviewPhoto[];
    user_nickname?: string;
}

interface ServiceMenu {
    id: number;
    salon_id: string;
    service_type: string;
    service_name: string;
    service_description: string;
    price: number;
}

function SalonDetail() {
    const [salon, setSalon] = useState<Salon | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams<{ id: string }>();
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [showAllHours, setShowAllHours] = useState<boolean>(false);
    const [showMapModal, setShowMapModal] = useState<boolean>(false);
    const [stylists, setStylists] = useState<Stylist[]>([]); // 스타일리스트 상태 추가
    const [serviceMenus, setServiceMenus] = useState<ServiceMenu[]>([]); // 서비스 메뉴 상태 추가
    const [reviews, setReviews] = useState<Review[]>([]); // 리뷰 상태 추가

    const isDayOff = (dayIndex: number, holidayMask: number) => {
        const bitValue = 1 << dayIndex;
        return (holidayMask & bitValue) !== 0;
    };

    // 지도 표시 함수
    const showMap = () => {
        setShowMapModal(true);
    };

    // 지도 모달 닫기 함수
    const closeMapModal = () => {
        setShowMapModal(false);
    };

    const toggleBusinessHours = () => {
        setShowAllHours(!showAllHours);
    };


    useEffect(() => {
        const fetchSalonDetail = async () => {
            try {
                setLoading(true);

                // 이미지 매핑
                const imageMap: Record<string, string> = {
                    'salon1.jpeg': salon1Image,
                    'salon2.png': salon2Image,
                    'salon3.png': salon3Image,
                    'hair1.png' : hair1Image,
                    'hair2.png' : hair2Image
                };

                // salon.json에서 id와 일치하는 살롱 찾기
                const foundSalon = salonData.find(salon => salon.id === id);

                if (foundSalon) {
                    const salonWithDetails: Salon = {
                        ...foundSalon,
                        photos: [
                            {photoId: 1, photoUrl: imageMap[foundSalon.photoUrl] || salon1Image, photoOrder: 1},
                            {photoId: 2, photoUrl: salon2Image, photoOrder: 2},
                            {photoId: 3, photoUrl: salon3Image, photoOrder: 3}
                        ],
                        businessHours: [
                            { day: "월", open: foundSalon.start_time, close: foundSalon.end_time },
                            { day: "화", open: foundSalon.start_time, close: foundSalon.end_time },
                            { day: "수", open: foundSalon.start_time, close: foundSalon.end_time },
                            { day: "목", open: foundSalon.start_time, close: foundSalon.end_time },
                            { day: "금", open: foundSalon.start_time, close: foundSalon.end_time },
                            { day: "토", open: foundSalon.start_time, close: foundSalon.end_time },
                            { day: "일", open: foundSalon.start_time, close: foundSalon.end_time }
                        ]
                    };

                    setSalon(salonWithDetails);

                    const salonStylists = stylistData.filter(stylist => stylist.salon_id === foundSalon.id);
                    setStylists(salonStylists);

                    const salonServices = serviceMenuData.filter(service => service.salon_id === foundSalon.id);
                    setServiceMenus(salonServices);


                    const salonReviews = reviewData.filter(review => review.salon_id === foundSalon.id)
                        .map(review => {
                            const reviewPhotos = reviewPhotoData.filter(photo => photo.review_id === review.id);

                            const user = userData.find(user => user.id === review.user_id);
                            const userNickname = user ? user.nickname : '익명';

                            return {
                                ...review,
                                photos: reviewPhotos,
                                user_nickname: userNickname
                            };
                        })
                        .sort((a, b) => new Date(b.reg_date).getTime() - new Date(a.reg_date).getTime()); // 최신순 정렬

                    setReviews(salonReviews);

                    setLoading(false);
                } else {
                    setError(`ID: ${id}에 해당하는 살롱을 찾을 수 없습니다.`);
                    setLoading(false);
                }

                // 실제 API 호출 코드 (주석 처리)
                /*
                const response = await axios.get(`http://localhost:8080/api/salons/${id}/with-photos`);
                setSalon(response.data);
                setLoading(false);
                */
            } catch (err) {
                setError('살롱 상세 정보를 불러오는데 실패했습니다.');
                console.error('살롱 상세 정보 불러오기 오류:', err);
                setLoading(false);
            }
        };

        fetchSalonDetail();
    }, [id]);

    // 지도 api
    useEffect(() => {
        if (showMapModal && salon) {
            const script = document.createElement('script');
            script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=cv8i9hdmhu`;
            script.async = true;
            document.head.appendChild(script);

            script.onload = () => {
                const mapOptions = {
                    center: new window.naver.maps.LatLng(salon.latitude, salon.longitude),
                    zoom: 15,
                    zoomControl: true,
                    zoomControlOptions: {
                        position: window.naver.maps.Position.TOP_RIGHT
                    }
                };

                const map = new window.naver.maps.Map('map', mapOptions);

                // 마커 생성
                const marker = new window.naver.maps.Marker({
                    position: new window.naver.maps.LatLng(salon.latitude, salon.longitude),
                    map: map,
                    title: salon.name
                });

                const infoWindow = new window.naver.maps.InfoWindow({
                    content: `<div style="padding:10px;width:200px;text-align:center;">
                   <strong>${salon.name}</strong><br>
                   ${salon.address || ''}
                 </div>`
                });

                window.naver.maps.Event.addListener(marker, 'click', () => {
                    infoWindow.open(map, marker);
                });

                infoWindow.open(map, marker);
            };

            return () => {
                const existingScript = document.querySelector(`script[src^="https://openapi.map.naver.com"]`);
                if (existingScript && existingScript.parentNode) {
                    existingScript.parentNode.removeChild(existingScript);
                }
            };
        }
    }, [showMapModal, salon]);

    const nextImage = () => {
        if (salon && salon.photos) {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % salon.photos.length);
        }
    };

    const prevImage = () => {
        if (salon && salon.photos) {
            setCurrentImageIndex((prevIndex) => (prevIndex - 1 + salon.photos.length) % salon.photos.length);
        }
    };

    // 별점 렌더링 함수
    const renderStars = (score: number) => {
        const fullStars = Math.floor(score);
        const hasHalfStar = score - fullStars >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="stars-container">
                {[...Array(fullStars)].map((_, i) => (
                    <StarIcon key={`full-${i}`} className="star-icon filled" sx={{ color: '#FFD700' }} />
                ))}
                {hasHalfStar && (
                    <StarHalfIcon className="star-icon half" sx={{ color: '#FFD700' }} />
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <StarBorderIcon key={`empty-${i}`} className="star-icon empty" sx={{ color: '#FFD700' }} />
                ))}
            </div>
        );
    };

    // 시간 형식화 함수 (n시간 전, n일 전 등)
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return '방금 전';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}분 전`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}시간 전`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}일 전`;
        } else if (diffInSeconds < 31536000) {
            const months = Math.floor(diffInSeconds / 2592000);
            return `${months}개월 전`;
        } else {
            const years = Math.floor(diffInSeconds / 31536000);
            return `${years}년 전`;
        }
    };



    if (loading) {
        return <div className="loading-container">살롱 정보 로딩 중...</div>;
    }

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    if (!salon) {
        return <div className="error-container">살롱 정보를 찾을 수 없습니다.</div>;
    }

    const dayToIndex: Record<string, number> = {
        '월': 0,
        '화': 1,
        '수': 2,
        '목': 3,
        '금': 4,
        '토': 5,
        '일': 6
    };

    return (
        <div className="salon-detail-container">
            {/* 이미지 갤러리 */}
            <div className="salon-gallery">
                {salon.photos && salon.photos.length > 0 && (
                    <>
                        <div className="gallery-image">
                            <img
                                src={salon.photos[currentImageIndex].photoUrl}
                                alt={`${salon.name} 이미지 ${currentImageIndex + 1}`}
                            />
                            <button className="gallery-nav prev" onClick={prevImage}>
                                <ArrowBackIosNewIcon />
                            </button>
                            <button className="gallery-nav next" onClick={nextImage}>
                                <ArrowForwardIosIcon />
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="salon-header">
                <h1>{salon.name}</h1>
                <div className="salon-rating">
                    <StarIcon sx={{ color: '#FFD700' }} />
                    <span>{salon.score} / 5</span>
                </div>
            </div>

            <div className="reservation-buttons">
                <button className="reservation-btn calendar">
                    <span className="icon">📅</span> Reservation
                </button>
                <button className="reservation-btn phone">
                    <span className="icon">📞</span> Reservation
                </button>
            </div>

            {/* 영업 시간 */}
            <div className="info-section">
                <div className="info-header" onClick={toggleBusinessHours}>
                    <AccessTimeIcon />
                    <h2>Business hours | {salon.start_time} ~ {salon.end_time}</h2>
                    <KeyboardArrowDownIcon className={showAllHours ? "rotated" : ""} />
                </div>
                {showAllHours && (
                    <div className="business-hours-detail">
                        {salon.businessHours && salon.businessHours.map((hour, index) => (
                            <div key={index} className="hour-row">
                                <span className="day">{hour.day}</span>
                                {isDayOff(dayToIndex[hour.day], salon.holiday_mask) ? (
                                    <span className="holiday">휴무</span>
                                ) : (
                                    <span className="time">{hour.open} ~ {hour.close}</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 상세 주소 정보 추가 */}
            {salon.detail_address && (
                <div className="info-section">
                    <div className="info-header">
                        <LocationOnIcon />
                        <h2>상세 위치</h2>
                    </div>
                    <div className="detail-address-info">
                        <p>{salon.detail_address}</p>
                    </div>
                </div>
            )}

            {/* 매장 정보 */}
            <div className="info-section">
                <div className="info-header">
                    <InfoIcon />
                    <h2>Store Information</h2>
                </div>
                <div className="store-info">
                    <p dangerouslySetInnerHTML={{__html: salon.introduction.replace(/\n/g, '<br>')}}></p>
                </div>
            </div>
            <div className="information-nav">
                <div className="nav-item" onClick={showMap}>
                    <LocationOnIcon/>
                    <span>location</span>
                </div>
                <div className="nav-item">
                    <PhoneIcon/>
                    <span>phone call</span>
                </div>
            </div>

            {/* 스타일리스트 섹션 추가 */}
            <div className="info-section stylists-section">
                <div className="info-header stylists-header">
                    <PersonIcon/>
                    <h2>스타일리스트</h2>
                    <Link to="/hairSalon/stylists/SALON001" className="view-all-link">
                        모두보기 <KeyboardArrowRightIcon/>
                    </Link>
                </div>
                <div className="stylists-list">
                    {stylists.length > 0 ? (
                        stylists.slice(0, 2).map((stylist) => (
                            <div key={stylist.stylist_id} className="stylist-item">
                                <div className="stylist-avatar">
                                    <img
                                        src={salon3Image}
                                        alt={stylist.name}
                                        className="stylist-profile-image"
                                    />
                                </div>
                                <div className="stylist-info">
                                    <h3 className="stylist-name">{stylist.name}</h3>
                                    <p className="stylist-position">
                                        {stylist.introduction ?
                                            stylist.introduction.split('.')[0] :
                                            "헤어 디자이너"}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-stylists">등록된 스타일리스트가 없습니다.</p>
                    )}
                </div>
            </div>

            {/* 서비스 메뉴 섹션 추가 */}
            <div className="info-section service-menu-section">
                <div className="info-header service-menu-header">
                    <InfoIcon />
                    <h2>서비스 메뉴</h2>
                    <Link to="/services" className="view-all-link">
                        모두보기 <KeyboardArrowRightIcon/>
                    </Link>
                </div>
                <div className="service-menu-list">
                    {serviceMenus.length > 0 ? (
                        serviceMenus.slice(0, 2).map((service) => (
                            <div key={service.id} className="service-menu-item">
                                <div className="service-info">
                                    <h3 className="service-name">{service.service_name}</h3>
                                    <p className="service-type">{service.service_type}</p>
                                    <p className="service-description">{service.service_description}</p>
                                </div>
                                <div className="service-price">
                                    <p>{service.price.toLocaleString()}원</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-services">등록된 서비스 메뉴가 없습니다.</p>
                    )}
                </div>
            </div>

            {/* 리뷰 섹션 추가 */}
            <div className="info-section reviews-section">
                <div className="info-header reviews-header">
                    <StarIcon />
                    <h2>리뷰</h2>
                    <Link to={`/reviews/${salon.id}`} className="view-all-link">
                        모두보기 <KeyboardArrowRightIcon/>
                    </Link>
                </div>
                <div className="reviews-list">
                    {reviews.length > 0 ? (
                        reviews.slice(0, 3).map((review) => (
                            <div key={review.id} className="review-item">
                                <div className="review-header">
                                    <div className="review-title">
                                        {renderStars(review.score)}
                                    </div>
                                    <div className="review-user">
                                        {review.user_nickname} | {formatTimeAgo(review.reg_date)}
                                    </div>
                                </div>

                                <div className="review-content">
                                    <p>{review.content}</p>
                                </div>

                                {review.photos && review.photos.length > 0 && (
                                    <div className="review-photos">
                                        {review.photos.map((photo) => (
                                            <div key={photo.photo_id} className="review-photo">
                                                <img
                                                    src={photo.photo_url}
                                                    alt={`리뷰 사진 ${photo.photo_id}`}
                                                    onError={(e) => {
                                                        // 이미지 로드 실패 시 대체 이미지 설정
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = salon1Image;
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {review.review_tag && (
                                    <div className="review-tags">
                                        {review.review_tag.split(',').map((tag, index) => (
                                            <span key={index} className="review-tag">
                                                #{tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="review-salon-reply">
                                    <div className="salon-reply-header">
                                        <strong>{salon.name}</strong>
                                        <span className="reply-time">1 hour ago</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-reviews">등록된 리뷰가 없습니다.</p>
                    )}
                </div>
            </div>

            {showMapModal && (
                <div className="map-modal">
                    <div className="map-modal-content">
                        <div className="map-header">
                            <h3>{salon.name} 위치</h3>
                            <button className="close-btn" onClick={closeMapModal}>×</button>
                        </div>
                        <div className="map-container" id="map">
                            {/* 네이버 지도가 로드될 div */}
                        </div>
                        <div className="map-address">
                            <p>{salon.address}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SalonDetail;