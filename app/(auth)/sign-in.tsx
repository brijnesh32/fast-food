import { Button, Text, View } from 'react-native'
import React, { Component } from 'react'
import { router } from 'expo-router'

export class signin extends Component {
  render() {
    return (
      <View>
        <Text>sign-in</Text>
        <Button title='Sign Up' onPress={()=>router.push( href:'/sign-up')}/>
      </View>
    )
  }
}

export default signin