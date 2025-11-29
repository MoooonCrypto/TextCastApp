// ios/iCloudDriveStorage.swift
// iCloud Drive を使ったファイルストレージ

import Foundation
import React

@objc(iCloudDriveStorage)
class iCloudDriveStorage: NSObject {

  private let fileManager = FileManager.default
  private var iCloudContainerURL: URL?
  private let appFolderName = "TextCast"

  // MARK: - Initialization

  override init() {
    super.init()
    setupiCloudContainer()
  }

  private func setupiCloudContainer() {
    // iCloud Containerのルートディレクトリを取得
    if let url = fileManager.url(forUbiquityContainerIdentifier: nil)?
        .appendingPathComponent("Documents")
        .appendingPathComponent(appFolderName) {
      iCloudContainerURL = url

      // フォルダが存在しない場合は作成
      if !fileManager.fileExists(atPath: url.path) {
        try? fileManager.createDirectory(at: url, withIntermediateDirectories: true)
      }

      print("[iCloud] ✅ Container URL: \(url.path)")
    } else {
      print("[iCloud] ❌ iCloud container not available")
    }
  }

  // MARK: - React Native Methods

  /// iCloudが利用可能かチェック
  @objc
  func isAvailable(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    if iCloudContainerURL != nil {
      resolver(true)
    } else {
      resolver(false)
    }
  }

  /// ファイルをiCloud Driveに保存
  @objc
  func saveFile(_ filename: String, content: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    guard let containerURL = iCloudContainerURL else {
      rejecter("UNAVAILABLE", "iCloud Drive is not available", nil)
      return
    }

    DispatchQueue.global(qos: .background).async { [weak self] in
      guard let self = self else {
        rejecter("ERROR", "Instance deallocated", nil)
        return
      }

      let fileURL = containerURL.appendingPathComponent(filename)

      do {
        // JSONデータを保存
        try content.write(to: fileURL, atomically: true, encoding: .utf8)
        print("[iCloud] ✅ Saved file: \(filename)")
        resolver(fileURL.path)
      } catch {
        print("[iCloud] ❌ Failed to save file: \(error)")
        rejecter("SAVE_ERROR", "Failed to save file: \(error.localizedDescription)", error)
      }
    }
  }

  /// ファイルをiCloud Driveから読み込み
  @objc
  func loadFile(_ filename: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    guard let containerURL = iCloudContainerURL else {
      rejecter("UNAVAILABLE", "iCloud Drive is not available", nil)
      return
    }

    DispatchQueue.global(qos: .background).async { [weak self] in
      guard let self = self else {
        rejecter("ERROR", "Instance deallocated", nil)
        return
      }

      let fileURL = containerURL.appendingPathComponent(filename)

      // ファイルが存在しない場合
      if !self.fileManager.fileExists(atPath: fileURL.path) {
        print("[iCloud] ℹ️ File not found: \(filename)")
        resolver(NSNull())
        return
      }

      do {
        // 最新版をダウンロード（iCloudから）
        try self.fileManager.startDownloadingUbiquitousItem(at: fileURL)

        // 少し待機（ダウンロード完了を待つ）
        Thread.sleep(forTimeInterval: 0.5)

        // ファイルを読み込み
        let content = try String(contentsOf: fileURL, encoding: .utf8)
        print("[iCloud] ✅ Loaded file: \(filename)")
        resolver(content)
      } catch {
        print("[iCloud] ❌ Failed to load file: \(error)")
        rejecter("LOAD_ERROR", "Failed to load file: \(error.localizedDescription)", error)
      }
    }
  }

  /// ファイルを削除
  @objc
  func deleteFile(_ filename: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    guard let containerURL = iCloudContainerURL else {
      rejecter("UNAVAILABLE", "iCloud Drive is not available", nil)
      return
    }

    DispatchQueue.global(qos: .background).async { [weak self] in
      guard let self = self else {
        rejecter("ERROR", "Instance deallocated", nil)
        return
      }

      let fileURL = containerURL.appendingPathComponent(filename)

      do {
        if self.fileManager.fileExists(atPath: fileURL.path) {
          try self.fileManager.removeItem(at: fileURL)
          print("[iCloud] ✅ Deleted file: \(filename)")
        }
        resolver(true)
      } catch {
        print("[iCloud] ❌ Failed to delete file: \(error)")
        rejecter("DELETE_ERROR", "Failed to delete file: \(error.localizedDescription)", error)
      }
    }
  }

  /// ファイル一覧を取得
  @objc
  func listFiles(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    guard let containerURL = iCloudContainerURL else {
      rejecter("UNAVAILABLE", "iCloud Drive is not available", nil)
      return
    }

    DispatchQueue.global(qos: .background).async { [weak self] in
      guard let self = self else {
        rejecter("ERROR", "Instance deallocated", nil)
        return
      }

      do {
        let files = try self.fileManager.contentsOfDirectory(at: containerURL, includingPropertiesForKeys: nil)
        let filenames = files.map { $0.lastPathComponent }
        print("[iCloud] ✅ Listed \(filenames.count) files")
        resolver(filenames)
      } catch {
        print("[iCloud] ❌ Failed to list files: \(error)")
        rejecter("LIST_ERROR", "Failed to list files: \(error.localizedDescription)", error)
      }
    }
  }

  /// ファイルのメタデータを取得
  @objc
  func getFileMetadata(_ filename: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    guard let containerURL = iCloudContainerURL else {
      rejecter("UNAVAILABLE", "iCloud Drive is not available", nil)
      return
    }

    DispatchQueue.global(qos: .background).async { [weak self] in
      guard let self = self else {
        rejecter("ERROR", "Instance deallocated", nil)
        return
      }

      let fileURL = containerURL.appendingPathComponent(filename)

      do {
        let attributes = try self.fileManager.attributesOfItem(atPath: fileURL.path)

        let metadata: [String: Any] = [
          "size": attributes[.size] as? Int ?? 0,
          "modificationDate": (attributes[.modificationDate] as? Date)?.timeIntervalSince1970 ?? 0,
          "creationDate": (attributes[.creationDate] as? Date)?.timeIntervalSince1970 ?? 0,
        ]

        resolver(metadata)
      } catch {
        rejecter("METADATA_ERROR", "Failed to get metadata: \(error.localizedDescription)", error)
      }
    }
  }

  // MARK: - React Native Module Setup

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
