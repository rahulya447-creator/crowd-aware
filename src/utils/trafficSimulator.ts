/**
 * Realistic Traffic Simulation
 * Simulates traffic based on time of day, route type, and random variation
 */

import { RoadEdge } from './roadNetwork';

/**
 * Get current traffic multiplier based on time of day
 * @returns multiplier (1.0 = normal, >1.0 = heavier traffic)
 */
export const getCurrentTrafficMultiplier = (): number => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Weekend traffic is generally lighter
    const isWeekend = day === 0 || day === 6;
    const weekendFactor = isWeekend ? 0.7 : 1.0;

    // Rush hours: 8-10 AM and 5-8 PM on weekdays
    if (!isWeekend) {
        if (hour >= 8 && hour < 10) {
            return 1.8 * weekendFactor; // Morning rush
        }
        if (hour >= 17 && hour < 20) {
            return 2.0 * weekendFactor; // Evening rush (worse)
        }
    }

    // Late night (11 PM - 6 AM) - very light traffic
    if (hour >= 23 || hour < 6) {
        return 0.5 * weekendFactor;
    }

    // Daytime (10 AM - 5 PM) - moderate traffic
    if (hour >= 10 && hour < 17) {
        return 1.2 * weekendFactor;
    }

    // Evening (8 PM - 11 PM) - light to moderate
    if (hour >= 20 && hour < 23) {
        return 0.8 * weekendFactor;
    }

    // Default
    return 1.0 * weekendFactor;
};

/**
 * Calculate crowd level for a route type
 * @param roadType - Type of road (highway, main, local)
 * @returns 'low' | 'medium' | 'high'
 */
export const calculateCrowdLevel = (
    roadType: 'highway' | 'main' | 'local'
): 'low' | 'medium' | 'high' => {
    const trafficMultiplier = getCurrentTrafficMultiplier();

    // Base crowd levels by road type
    let baseCrowd = 0;
    if (roadType === 'highway') {
        baseCrowd = 0.3; // Highways are generally less crowded
    } else if (roadType === 'main') {
        baseCrowd = 0.6; // Main roads have moderate traffic
    } else {
        baseCrowd = 0.8; // Local roads can be very crowded
    }

    // Apply time-based multiplier
    const finalCrowd = baseCrowd * trafficMultiplier;

    // Add random variation (±20%)
    const variation = (Math.random() - 0.5) * 0.4;
    const crowdWithVariation = Math.max(0.1, Math.min(1.5, finalCrowd + variation));

    // Convert to category
    if (crowdWithVariation < 0.5) return 'low';
    if (crowdWithVariation < 1.0) return 'medium';
    return 'high';
};

/**
 * Calculate junction wait time without AI
 * @param crowdLevel - Current crowd density
 * @param roadType - Type of road
 * @returns wait time in seconds
 */
export const calculateJunctionWaitTime = (
    crowdLevel: 'low' | 'medium' | 'high',
    roadType: 'highway' | 'main' | 'local'
): number => {
    // Base wait times by crowd level
    let baseWaitTime = 0;
    if (crowdLevel === 'low') {
        baseWaitTime = 45; // 45 seconds
    } else if (crowdLevel === 'medium') {
        baseWaitTime = 90; // 1.5 minutes
    } else {
        baseWaitTime = 150; // 2.5 minutes
    }

    // Local roads have longer wait times due to complex junctions
    if (roadType === 'local') {
        baseWaitTime *= 1.3;
    } else if (roadType === 'highway') {
        baseWaitTime *= 0.8; // Highways have better signal coordination
    }

    // Add random variation (±25%)
    const variation = (Math.random() - 0.5) * 0.5;
    const waitTime = Math.max(20, baseWaitTime * (1 + variation));

    return Math.round(waitTime);
};

/**
 * Calculate AI-optimized wait time
 * AI reduces wait time based on crowd density
 * @param waitTimeWithoutAI - Original wait time
 * @param crowdLevel - Current crowd level
 * @returns optimized wait time in seconds
 */
export const calculateAIOptimizedTime = (
    waitTimeWithoutAI: number,
    crowdLevel: 'low' | 'medium' | 'high'
): number => {
    // AI optimization effectiveness by crowd level
    let reductionFactor = 0;

    if (crowdLevel === 'low') {
        // Low crowd: minimal optimization needed (5-15% reduction)
        reductionFactor = 0.05 + Math.random() * 0.10;
    } else if (crowdLevel === 'medium') {
        // Medium crowd: moderate optimization (20-35% reduction)
        reductionFactor = 0.20 + Math.random() * 0.15;
    } else {
        // High crowd: maximum optimization (30-45% reduction)
        reductionFactor = 0.30 + Math.random() * 0.15;
    }

    const optimizedTime = waitTimeWithoutAI * (1 - reductionFactor);
    return Math.round(Math.max(15, optimizedTime)); // Minimum 15 seconds
};

/**
 * Calculate number of vehicles waiting at junction
 * @param crowdLevel - Current crowd level
 * @returns number of vehicles
 */
export const calculateVehiclesWaiting = (
    crowdLevel: 'low' | 'medium' | 'high'
): number => {
    let baseVehicles = 0;

    if (crowdLevel === 'low') {
        baseVehicles = 5 + Math.random() * 10; // 5-15 vehicles
    } else if (crowdLevel === 'medium') {
        baseVehicles = 15 + Math.random() * 20; // 15-35 vehicles
    } else {
        baseVehicles = 30 + Math.random() * 25; // 30-55 vehicles
    }

    return Math.round(baseVehicles);
};

/**
 * Get dominant crowd level from multiple segments
 */
export const getDominantCrowdLevel = (segments: RoadEdge[]): 'low' | 'medium' | 'high' => {
    const crowdLevels = segments.map(seg => calculateCrowdLevel(seg.roadType));

    // Count occurrences
    const counts = {
        low: crowdLevels.filter(c => c === 'low').length,
        medium: crowdLevels.filter(c => c === 'medium').length,
        high: crowdLevels.filter(c => c === 'high').length
    };

    // Return the most common, with tie-breaker to higher congestion
    if (counts.high > 0) return 'high';
    if (counts.medium >= counts.low) return 'medium';
    return 'low';
};

/**
 * Calculate estimated travel time for a route
 * @param distance - Total distance in km
 * @param segments - Road segments
 * @returns time in minutes
 */
export const calculateTravelTime = (distance: number, segments: RoadEdge[]): number => {
    const trafficMultiplier = getCurrentTrafficMultiplier();

    // Calculate time for each segment based on road type and traffic
    let totalTimeHours = 0;

    segments.forEach(segment => {
        let effectiveSpeed = segment.baseSpeed;

        // Apply traffic multiplier
        effectiveSpeed = effectiveSpeed / trafficMultiplier;

        // Road type affects how traffic impacts speed
        const crowdLevel = calculateCrowdLevel(segment.roadType);
        if (crowdLevel === 'high') {
            effectiveSpeed *= 0.6; // Severe slowdown
        } else if (crowdLevel === 'medium') {
            effectiveSpeed *= 0.75; // Moderate slowdown
        }

        // Calculate time for this segment
        const segmentTimeHours = segment.distance / effectiveSpeed;
        totalTimeHours += segmentTimeHours;
    });

    // Convert to minutes and add buffer time
    const totalMinutes = totalTimeHours * 60;
    const bufferTime = 2 + Math.random() * 3; // 2-5 minutes buffer

    return Math.round(totalMinutes + bufferTime);
};
