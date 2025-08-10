// Quick test script to verify Supabase connection
// Run with: node test-supabase.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://htgptkeyodfbfsgjuikg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Z3B0a2V5b2RmYmZzZ2p1aWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MDQyMzAsImV4cCI6MjA3MDM4MDIzMH0.wFL6VI_TbHdNyaqkj3OXCJkcS0kvdkv4u842BnRbpi0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('events')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ Connection failed:', error.message)
      console.log('💡 Make sure you have run the setup-database.sql script in your Supabase SQL editor')
      return
    }
    
    console.log('✅ Supabase connection successful!')
    
    // Test events table
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(3)
    
    if (eventsError) {
      console.log('❌ Events table error:', eventsError.message)
    } else {
      console.log(`✅ Found ${events.length} events in database`)
      if (events.length > 0) {
        console.log('📄 Sample event:', events[0].name)
      }
    }
    
    console.log('\n🎉 Supabase integration is working correctly!')
    console.log('🚀 Your Avolink application is ready to use!')
    
  } catch (err) {
    console.log('❌ Error testing connection:', err.message)
    console.log('💡 Make sure your .env.local file has the correct Supabase credentials')
  }
}

testConnection()
