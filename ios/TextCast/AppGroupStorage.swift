//
//  AppGroupStorage.swift
//  TextCast
//
//  App Group経由でデータを共有するネイティブモジュール
//

import Foundation
import React

@objc(AppGroupStorage)
class AppGroupStorage: NSObject {

  private let appGroupID = "group.com.textcastapp.ios.shared"

  // React Nativeからアクセス可能なメソッド
  @objc
  func setItem(_ key: String, value: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    guard let userDefaults = UserDefaults(suiteName: appGroupID) else {
      rejecter("ERROR", "Failed to access App Group", nil)
      return
    }

    userDefaults.set(value, forKey: key)
    userDefaults.synchronize()
    resolver(nil)
  }

  @objc
  func getItem(_ key: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    guard let userDefaults = UserDefaults(suiteName: appGroupID) else {
      rejecter("ERROR", "Failed to access App Group", nil)
      return
    }

    let value = userDefaults.string(forKey: key)
    resolver(value)
  }

  @objc
  func removeItem(_ key: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    guard let userDefaults = UserDefaults(suiteName: appGroupID) else {
      rejecter("ERROR", "Failed to access App Group", nil)
      return
    }

    userDefaults.removeObject(forKey: key)
    userDefaults.synchronize()
    resolver(nil)
  }

  // React Nativeからこのモジュールを呼び出せるようにする
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
