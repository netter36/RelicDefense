/**
 * 유틸리티 함수 모듈
 * 공통으로 사용되는 헬퍼 함수들을 모아둔 파일
 */

import { ELEMENT_COLORS } from '../constants.js';

/**
 * 요소별 16진수 색상 문자열 매핑
 */
export const ELEMENT_COLORS_HEX = {
    fire: '#ff5555',
    ice: '#33ddff',
    thunder: '#ffeb3b',
    leaf: '#4caf50',
    gem: '#e040fb'
};

/**
 * 요소 색상을 16진수 문자열로 변환
 * @param {string} element - 요소 타입
 * @returns {string} 16진수 색상 문자열
 */
export function getElementColorHex(element) {
    return ELEMENT_COLORS_HEX[element] || '#ffffff';
}

/**
 * 숫자를 16진수 색상 문자열로 변환
 * @param {number} color - 숫자형 색상 값
 * @returns {string} 16진수 색상 문자열
 */
export function numberToHex(color) {
    return '#' + color.toString(16).padStart(6, '0');
}

/**
 * 두 점 사이의 거리 계산
 * @param {number} x1 - 첫 번째 점의 x 좌표
 * @param {number} y1 - 첫 번째 점의 y 좌표
 * @param {number} x2 - 두 번째 점의 x 좌표
 * @param {number} y2 - 두 번째 점의 y 좌표
 * @returns {number} 두 점 사이의 거리
 */
export function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * 월드 좌표를 그리드 좌표로 변환
 * @param {number} worldX - 월드 X 좌표
 * @param {number} worldY - 월드 Y 좌표
 * @param {number} startX - 그리드 시작 X 좌표
 * @param {number} startY - 그리드 시작 Y 좌표
 * @param {number} slotSize - 슬롯 크기
 * @returns {{x: number, y: number}} 그리드 좌표
 */
export function worldToGrid(worldX, worldY, startX, startY, slotSize) {
    return {
        x: Math.floor((worldX - startX) / slotSize),
        y: Math.floor((worldY - startY) / slotSize)
    };
}

/**
 * 그리드 좌표를 월드 좌표(중심점)로 변환
 * @param {number} gridX - 그리드 X 좌표
 * @param {number} gridY - 그리드 Y 좌표
 * @param {number} startX - 그리드 시작 X 좌표
 * @param {number} startY - 그리드 시작 Y 좌표
 * @param {number} slotSize - 슬롯 크기
 * @param {number} width - 아이템 너비 (슬롯 단위)
 * @param {number} height - 아이템 높이 (슬롯 단위)
 * @returns {{x: number, y: number}} 월드 좌표 (중심점)
 */
export function gridToWorld(gridX, gridY, startX, startY, slotSize, width = 1, height = 1) {
    return {
        x: startX + gridX * slotSize + (width * slotSize) / 2,
        y: startY + gridY * slotSize + (height * slotSize) / 2
    };
}

/**
 * 디버프가 존재하는지 확인
 * @param {Array} debuffs - 디버프 배열
 * @param {string} type - 확인할 디버프 타입
 * @returns {boolean} 디버프 존재 여부
 */
export function hasDebuff(debuffs, type) {
    return debuffs?.some(d => d.type === type) || false;
}

/**
 * 랜덤 범위 값 생성
 * @param {number} min - 최소값
 * @param {number} max - 최대값
 * @returns {number} min과 max 사이의 랜덤 값
 */
export function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

/**
 * 값을 지정된 범위 내로 제한
 * @param {number} value - 제한할 값
 * @param {number} min - 최소값
 * @param {number} max - 최대값
 * @returns {number} 범위 내로 제한된 값
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
