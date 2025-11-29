//
//  ShareViewController.swift
//  TextCastShare
//
//  Created by daisuke on 2025/11/23.
//

import UIKit
import Social
import UniformTypeIdentifiers

class ShareViewController: UIViewController {

    // App Group ID (メインアプリと共有)
    private let appGroupID = "group.com.textcastapp.ios.shared"
    private let sharedArticlesKey = "textcast_shared_articles"

    override func viewDidLoad() {
        super.viewDidLoad()

        // 共有されたURLを処理
        handleSharedURL()
    }

    private func handleSharedURL() {
        guard let extensionContext = extensionContext,
              let inputItems = extensionContext.inputItems as? [NSExtensionItem] else {
            completeRequest(success: false, message: "No items to share")
            return
        }

        // 最初のアイテムを処理
        guard let firstItem = inputItems.first,
              let attachments = firstItem.attachments else {
            completeRequest(success: false, message: "No attachments found")
            return
        }

        // URLを探す
        for attachment in attachments {
            if attachment.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                processURLAttachment(attachment)
                return
            } else if attachment.hasItemConformingToTypeIdentifier(UTType.propertyList.identifier) {
                processPropertyListAttachment(attachment)
                return
            }
        }

        completeRequest(success: false, message: "No URL found")
    }

    private func processURLAttachment(_ attachment: NSItemProvider) {
        attachment.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { [weak self] (item, error) in
            guard let self = self else { return }

            if let error = error {
                print("[Share] Error loading URL: \(error)")
                self.completeRequest(success: false, message: "Failed to load URL")
                return
            }

            if let url = item as? URL {
                self.saveSharedArticle(url: url.absoluteString, title: url.host ?? "Untitled")
            } else {
                self.completeRequest(success: false, message: "Invalid URL format")
            }
        }
    }

    private func processPropertyListAttachment(_ attachment: NSItemProvider) {
        attachment.loadItem(forTypeIdentifier: UTType.propertyList.identifier, options: nil) { [weak self] (item, error) in
            guard let self = self else { return }

            if let error = error {
                print("[Share] Error loading property list: \(error)")
                self.completeRequest(success: false, message: "Failed to load content")
                return
            }

            if let dictionary = item as? [String: Any],
               let results = dictionary[NSExtensionJavaScriptPreprocessingResultsKey] as? [String: Any],
               let urlString = results["url"] as? String ?? results["URL"] as? String {
                let title = results["title"] as? String ?? urlString
                self.saveSharedArticle(url: urlString, title: title)
            } else {
                self.completeRequest(success: false, message: "Could not extract URL")
            }
        }
    }

    private func saveSharedArticle(url: String, title: String) {
        print("[Share] Saving article - URL: \(url), Title: \(title)")

        // App Group経由でUserDefaultsにアクセス
        guard let userDefaults = UserDefaults(suiteName: appGroupID) else {
            print("[Share] Failed to access App Group")
            completeRequest(success: false, message: "Failed to save")
            return
        }

        // 既存の記事リストを取得
        var articles: [[String: Any]] = []
        if let savedData = userDefaults.data(forKey: sharedArticlesKey),
           let decoded = try? JSONSerialization.jsonObject(with: savedData) as? [[String: Any]] {
            articles = decoded
        }

        // 新しい記事を追加
        let newArticle: [String: Any] = [
            "id": "shared_\(Int(Date().timeIntervalSince1970 * 1000))_\(UUID().uuidString.prefix(7))",
            "url": url,
            "title": title,
            "content": "", // メインアプリで取得
            "excerpt": "",
            "sharedAt": ISO8601DateFormatter().string(from: Date()),
            "processed": false
        ]

        articles.append(newArticle)

        // 保存
        if let encoded = try? JSONSerialization.data(withJSONObject: articles) {
            userDefaults.set(encoded, forKey: sharedArticlesKey)
            userDefaults.synchronize()
            print("[Share] Article saved successfully")
            completeRequest(success: true, message: "Saved to TextCast!")
        } else {
            print("[Share] Failed to encode article")
            completeRequest(success: false, message: "Failed to save")
        }
    }

    private func completeRequest(success: Bool, message: String) {
        DispatchQueue.main.async { [weak self] in
            if success {
                // 成功時のUI表示（オプション）
                let alert = UIAlertController(
                    title: "Success",
                    message: message,
                    preferredStyle: .alert
                )
                self?.present(alert, animated: true) {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                        self?.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
                    }
                }
            } else {
                // エラー時
                let error = NSError(domain: "com.textcastapp.ios.share", code: 1, userInfo: [
                    NSLocalizedDescriptionKey: message
                ])
                self?.extensionContext?.cancelRequest(withError: error)
            }
        }
    }
}
