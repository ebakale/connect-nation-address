import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsRequest {
  analysisType: 'population-density' | 'service-delivery' | 'infrastructure-planning' | 'economic-impact'
  region?: string
  city?: string
  timeframe?: 'monthly' | 'quarterly' | 'yearly'
  includeProjections?: boolean
}

interface AdvancedAnalyticsResponse {
  analysisType: string
  data: any
  insights: string[]
  recommendations: string[]
  projections?: any
  metadata: {
    timestamp: string
    dataPoints: number
    confidenceLevel: number
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const {
      analysisType, region, city, timeframe = 'monthly', includeProjections = false
    }: AnalyticsRequest = await req.json()

    console.log('Advanced analytics request:', { analysisType, region, city })

    let analysisResult: any = {}
    let dataPoints = 0
    let confidenceLevel = 85

    switch (analysisType) {
      case 'population-density':
        analysisResult = await analyzePopulationDensity(supabaseClient, region, city)
        break
      
      case 'service-delivery':
        analysisResult = await analyzeServiceDelivery(supabaseClient, region, city)
        break
      
      case 'infrastructure-planning':
        analysisResult = await analyzeInfrastructurePlanning(supabaseClient, region, city, timeframe)
        break
      
      case 'economic-impact':
        analysisResult = await analyzeEconomicImpact(supabaseClient, region, city)
        break
      
      default:
        throw new Error(`Unsupported analysis type: ${analysisType}`)
    }

    // Generate projections if requested
    let projections = null
    if (includeProjections) {
      projections = generateProjections(analysisResult.data, analysisType, timeframe)
      confidenceLevel -= 10 // Projections are less certain
    }

    dataPoints = Array.isArray(analysisResult.data) ? analysisResult.data.length : 
                 (analysisResult.data ? Object.keys(analysisResult.data).length : 0)

    const response: AdvancedAnalyticsResponse = {
      analysisType,
      data: analysisResult.data,
      insights: analysisResult.insights,
      recommendations: analysisResult.recommendations,
      projections,
      metadata: {
        timestamp: new Date().toISOString(),
        dataPoints,
        confidenceLevel
      }
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in advanced analytics:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Population Density Analysis
async function analyzePopulationDensity(supabase: any, region?: string, city?: string) {
  let query = supabase
    .from('addresses')
    .select('region, city, address_type, latitude, longitude, created_at')
    .eq('verified', true)

  if (region) query = query.eq('region', region)
  if (city) query = query.eq('city', city)

  const { data: addresses, error } = await query

  if (error) throw error

  // Calculate density metrics
  const densityMap: Record<string, any> = {}
  const gridSize = 0.01 // ~1km grid

  addresses?.forEach(addr => {
    const gridX = Math.floor(addr.latitude / gridSize) * gridSize
    const gridY = Math.floor(addr.longitude / gridSize) * gridSize
    const gridKey = `${gridX}-${gridY}`

    if (!densityMap[gridKey]) {
      densityMap[gridKey] = {
        centerLat: gridX + gridSize/2,
        centerLng: gridY + gridSize/2,
        residential: 0,
        commercial: 0,
        industrial: 0,
        total: 0,
        region: addr.region,
        city: addr.city
      }
    }

    densityMap[gridKey][addr.address_type]++
    densityMap[gridKey].total++
  })

  const densityData = Object.values(densityMap)
  const highDensityAreas = densityData.filter((area: any) => area.total > 20)
  const lowDensityAreas = densityData.filter((area: any) => area.total < 5)

  const insights = [
    `Analyzed ${densityData.length} geographic grid areas`,
    `Found ${highDensityAreas.length} high-density areas (>20 addresses per km²)`,
    `Identified ${lowDensityAreas.length} low-density areas (<5 addresses per km²)`,
    `Average density: ${(addresses?.length / densityData.length).toFixed(1)} addresses per grid area`
  ]

  const recommendations = [
    highDensityAreas.length > 5 ? 'Consider traffic infrastructure improvements in high-density areas' : '',
    lowDensityAreas.length > 10 ? 'Evaluate service delivery efficiency in low-density areas' : '',
    'Plan utility expansion based on population density patterns',
    'Use density data for emergency response resource allocation'
  ].filter(Boolean)

  return {
    data: {
      densityGrid: densityData,
      summary: {
        totalAreas: densityData.length,
        highDensityAreas: highDensityAreas.length,
        lowDensityAreas: lowDensityAreas.length,
        averageDensity: addresses?.length / densityData.length
      }
    },
    insights,
    recommendations
  }
}

// Service Delivery Analysis
async function analyzeServiceDelivery(supabase: any, region?: string, city?: string) {
  // Get coverage analytics
  const { data: coverage, error: coverageError } = await supabase
    .from('coverage_analytics')
    .select('*')

  if (coverageError) throw coverageError

  // Calculate service delivery metrics
  let serviceAreas = coverage || []
  
  if (region) {
    serviceAreas = serviceAreas.filter((area: any) => area.region === region)
  }
  if (city) {
    serviceAreas = serviceAreas.filter((area: any) => area.city === city)
  }

  const deliveryMetrics = serviceAreas.map((area: any) => {
    const accessibilityScore = Math.min(100, 
      (area.verification_rate * 0.4) + 
      (area.publication_rate * 0.3) + 
      (area.addresses_registered > 0 ? 30 : 0)
    )

    const serviceEfficiency = area.addresses_verified / Math.max(1, area.addresses_registered) * 100

    return {
      ...area,
      accessibilityScore: Math.round(accessibilityScore),
      serviceEfficiency: Math.round(serviceEfficiency),
      deliveryPriority: accessibilityScore < 60 ? 'high' : accessibilityScore < 80 ? 'medium' : 'low'
    }
  })

  const avgAccessibility = deliveryMetrics.reduce((sum, area) => sum + area.accessibilityScore, 0) / deliveryMetrics.length
  const highPriorityAreas = deliveryMetrics.filter(area => area.deliveryPriority === 'high')

  const insights = [
    `Analyzed ${deliveryMetrics.length} service delivery areas`,
    `Average accessibility score: ${avgAccessibility.toFixed(1)}%`,
    `${highPriorityAreas.length} areas require priority service delivery improvements`,
    `Service efficiency ranges from ${Math.min(...deliveryMetrics.map(a => a.serviceEfficiency))}% to ${Math.max(...deliveryMetrics.map(a => a.serviceEfficiency))}%`
  ]

  const recommendations = [
    avgAccessibility < 70 ? 'Implement targeted service delivery improvements' : '',
    highPriorityAreas.length > 0 ? `Focus resources on ${highPriorityAreas.length} high-priority areas` : '',
    'Establish mobile service units for low-accessibility areas',
    'Create service delivery tracking system for continuous improvement'
  ].filter(Boolean)

  return {
    data: {
      serviceAreas: deliveryMetrics,
      summary: {
        totalAreas: deliveryMetrics.length,
        averageAccessibility: avgAccessibility,
        highPriorityAreas: highPriorityAreas.length
      }
    },
    insights,
    recommendations
  }
}

// Infrastructure Planning Analysis
async function analyzeInfrastructurePlanning(supabase: any, region?: string, city?: string, timeframe: string) {
  // Get historical address registration data
  const { data: addresses, error } = await supabase
    .from('addresses')
    .select('region, city, address_type, created_at, latitude, longitude')
    .eq('verified', true)
    .order('created_at', { ascending: true })

  if (error) throw error

  let filteredAddresses = addresses || []
  if (region) filteredAddresses = filteredAddresses.filter(addr => addr.region === region)
  if (city) filteredAddresses = filteredAddresses.filter(addr => addr.city === city)

  // Analyze growth patterns
  const timeGroups: Record<string, any[]> = {}
  const now = new Date()

  filteredAddresses.forEach(addr => {
    const date = new Date(addr.created_at)
    let timeKey: string

    switch (timeframe) {
      case 'monthly':
        timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'quarterly':
        timeKey = `${date.getFullYear()}-Q${Math.ceil((date.getMonth() + 1) / 3)}`
        break
      case 'yearly':
        timeKey = date.getFullYear().toString()
        break
      default:
        timeKey = date.toISOString().split('T')[0]
    }

    if (!timeGroups[timeKey]) timeGroups[timeKey] = []
    timeGroups[timeKey].push(addr)
  })

  const growthData = Object.entries(timeGroups).map(([period, addresses]) => ({
    period,
    addressCount: addresses.length,
    residential: addresses.filter(a => a.address_type === 'residential').length,
    commercial: addresses.filter(a => a.address_type === 'commercial').length,
    industrial: addresses.filter(a => a.address_type === 'industrial').length
  })).sort((a, b) => a.period.localeCompare(b.period))

  // Calculate growth rate
  const recentGrowth = growthData.slice(-3)
  const growthRate = recentGrowth.length > 1 ? 
    ((recentGrowth[recentGrowth.length - 1].addressCount - recentGrowth[0].addressCount) / recentGrowth[0].addressCount) * 100 : 0

  const insights = [
    `Analyzed ${filteredAddresses.length} addresses across ${growthData.length} time periods`,
    `Current growth rate: ${growthRate.toFixed(1)}% per ${timeframe}`,
    `Peak registration period: ${growthData.reduce((max, current) => current.addressCount > max.addressCount ? current : max, growthData[0])?.period}`,
    `Infrastructure demand trending ${growthRate > 5 ? 'upward' : growthRate < -5 ? 'downward' : 'stable'}`
  ]

  const recommendations = [
    growthRate > 10 ? 'Accelerate infrastructure development to meet high growth demand' : '',
    growthRate < 0 ? 'Optimize existing infrastructure for efficiency' : '',
    'Plan utility expansion based on address registration patterns',
    'Coordinate infrastructure development with regional growth trends'
  ].filter(Boolean)

  return {
    data: {
      growthTimeline: growthData,
      summary: {
        totalPeriods: growthData.length,
        currentGrowthRate: growthRate,
        totalAddresses: filteredAddresses.length
      }
    },
    insights,
    recommendations
  }
}

// Economic Impact Analysis
async function analyzeEconomicImpact(supabase: any, region?: string, city?: string) {
  // Get address and quality data
  const { data: addresses, error } = await supabase
    .from('addresses')
    .select('region, city, address_type, verified, public, completeness_score, created_at')

  if (error) throw error

  let filteredAddresses = addresses || []
  if (region) filteredAddresses = filteredAddresses.filter(addr => addr.region === region)
  if (city) filteredAddresses = filteredAddresses.filter(addr => addr.city === city)

  // Economic impact calculations
  const commercialAddresses = filteredAddresses.filter(addr => addr.address_type === 'commercial')
  const industrialAddresses = filteredAddresses.filter(addr => addr.address_type === 'industrial')
  const residentialAddresses = filteredAddresses.filter(addr => addr.address_type === 'residential')

  // Estimated economic values (simplified model)
  const economicMultipliers = {
    commercial: 50000, // USD per commercial address annually
    industrial: 200000, // USD per industrial address annually
    residential: 15000  // USD per residential address annually
  }

  const verifiedCommercial = commercialAddresses.filter(addr => addr.verified).length
  const verifiedIndustrial = industrialAddresses.filter(addr => addr.verified).length
  const verifiedResidential = residentialAddresses.filter(addr => addr.verified).length

  const estimatedImpact = {
    commercial: verifiedCommercial * economicMultipliers.commercial,
    industrial: verifiedIndustrial * economicMultipliers.industrial,
    residential: verifiedResidential * economicMultipliers.residential,
    total: 0
  }
  estimatedImpact.total = estimatedImpact.commercial + estimatedImpact.industrial + estimatedImpact.residential

  // Quality impact on economic value
  const avgQuality = filteredAddresses.reduce((sum, addr) => sum + (addr.completeness_score || 0), 0) / filteredAddresses.length
  const qualityMultiplier = avgQuality / 100
  const qualityAdjustedImpact = estimatedImpact.total * qualityMultiplier

  const insights = [
    `Estimated economic impact: $${(estimatedImpact.total / 1000000).toFixed(1)}M annually`,
    `Quality-adjusted impact: $${(qualityAdjustedImpact / 1000000).toFixed(1)}M annually`,
    `Commercial sector contributes ${((estimatedImpact.commercial / estimatedImpact.total) * 100).toFixed(1)}% of economic value`,
    `Average address quality: ${avgQuality.toFixed(1)}% (quality multiplier: ${qualityMultiplier.toFixed(2)})`
  ]

  const recommendations = [
    avgQuality < 80 ? 'Improve address quality to maximize economic impact' : '',
    verifiedCommercial < commercialAddresses.length * 0.8 ? 'Focus on commercial address verification for economic growth' : '',
    'Leverage address data for business development and investment planning',
    'Create economic development zones based on address density and quality'
  ].filter(Boolean)

  return {
    data: {
      economicImpact: estimatedImpact,
      qualityAdjustedImpact,
      breakdown: {
        commercial: { count: verifiedCommercial, impact: estimatedImpact.commercial },
        industrial: { count: verifiedIndustrial, impact: estimatedImpact.industrial },
        residential: { count: verifiedResidential, impact: estimatedImpact.residential }
      },
      qualityMetrics: {
        averageQuality: avgQuality,
        qualityMultiplier
      }
    },
    insights,
    recommendations
  }
}

// Generate projections
function generateProjections(data: any, analysisType: string, timeframe: string): any {
  // Simplified projection model
  const projectionPeriods = timeframe === 'monthly' ? 12 : timeframe === 'quarterly' ? 4 : 3
  
  switch (analysisType) {
    case 'population-density':
      return {
        expectedGrowth: '15-25% increase in registered addresses',
        newHighDensityAreas: Math.ceil(data.summary?.highDensityAreas * 0.2),
        infrastructureNeeds: ['Traffic management systems', 'Utility expansion', 'Public transport']
      }
    
    case 'service-delivery':
      return {
        accessibilityImprovement: '10-15% increase in accessibility scores',
        priorityAreaReduction: Math.floor(data.summary?.highPriorityAreas * 0.3),
        serviceExpansion: ['Mobile service units', 'Digital service portals', 'Community centers']
      }
    
    case 'infrastructure-planning':
      const currentGrowth = data.summary?.currentGrowthRate || 0
      return {
        projectedGrowth: `${(currentGrowth * projectionPeriods).toFixed(1)}% over next ${projectionPeriods} ${timeframe.slice(0, -2)}(s)`,
        infrastructureInvestment: `$${((data.summary?.totalAddresses || 0) * 1000 * (currentGrowth / 100)).toFixed(0)} estimated investment needed`,
        capacityPlanning: ['Utility infrastructure', 'Transportation networks', 'Emergency services']
      }
    
    case 'economic-impact':
      const projectedGrowth = 1.15 // 15% growth assumption
      return {
        projectedImpact: `$${((data.economicImpact?.total || 0) * projectedGrowth / 1000000).toFixed(1)}M projected annual impact`,
        qualityImprovement: 'Quality improvements could increase impact by 20-30%',
        investmentReturns: ['$5-10 ROI per $1 invested in address system', 'Reduced service delivery costs', 'Increased business efficiency']
      }
    
    default:
      return null
  }
}